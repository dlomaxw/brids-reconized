import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decodeAudioData, decode, PCM_SAMPLE_RATE, OUT_SAMPLE_RATE } from '../utils/audioStreamer';

interface UseLiveSessionReturn {
  isConnected: boolean;
  isListening: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  volume: number; // For visualization
}

export function useLiveSession(apiKey: string): UseLiveSessionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(true); // Default to listening when connected
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for cleanup
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    // Initialize GenAI instance
    if (apiKey) {
      aiRef.current = new GoogleGenAI({ apiKey });
    }
  }, [apiKey]);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    // Stop all playing audio
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    
    setIsConnected(false);
    sessionPromiseRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!aiRef.current) {
      setError("API Key not initialized");
      return;
    }
    setError(null);

    try {
      // Setup Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: PCM_SAMPLE_RATE });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUT_SAMPLE_RATE });
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Gemini Live
      const sessionPromise = aiRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Deep, nature-guide-like voice
          },
          systemInstruction: `You are an expert ornithologist and nature guide for Uganda and Rwanda. 
          Your goal is to help users identify birds by their calls and answer questions about local wildlife hotspots like Mabamba Swamp, Bwindi, and Nyungwe.
          Keep your responses concise, educational, and friendly. 
          If you hear a bird call, try to identify it. 
          If you are unsure, suggest likely candidates based on the region.
          Always mention if a bird is rare or endemic to the Albertine Rift.`,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            
            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (!isListening) return; // Mute logic

              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume visualization
              let sum = 0;
              for(let i=0; i<inputData.length; i+=10) sum += Math.abs(inputData[i]);
              setVolume(sum / (inputData.length/10));

              const blob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: blob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
               if (outputCtx.state === 'suspended') await outputCtx.resume();
               
               const audioBuffer = await decodeAudioData(
                 decode(audioData),
                 outputCtx,
                 OUT_SAMPLE_RATE,
                 1
               );

               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputCtx.destination);
               
               // Schedule playback
               const now = outputCtx.currentTime;
               // Ensure we don't schedule in the past, but keep continuity
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               
               sourcesRef.current.add(source);
               source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection error occurred.");
            setIsConnected(false);
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Failed to access microphone or connect.");
      cleanup();
    }
  }, [apiKey, isListening, cleanup]);

  const disconnect = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  return {
    isConnected,
    isListening,
    error,
    connect,
    disconnect,
    toggleMute,
    volume
  };
}
