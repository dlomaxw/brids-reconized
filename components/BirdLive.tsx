import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Radio, AlertCircle, Volume2, X } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';
import clsx from 'clsx';

interface BirdLiveProps {
  onClose: () => void;
}

const BirdLive: React.FC<BirdLiveProps> = ({ onClose }) => {
  const apiKey = process.env.API_KEY || '';
  const { isConnected, isListening, error, connect, disconnect, toggleMute, volume } = useLiveSession(apiKey);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    connect();
    return () => {
      // Disconnect is handled by hook's cleanup, but we can explicit here if needed
    };
  }, [connect]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/95 z-50 flex flex-col items-center justify-between p-6 text-white backdrop-blur-sm">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium tracking-wider text-stone-300">LIVE ID SESSION</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-8">
        
        <div className="relative">
          {/* Ripple Effect based on volume */}
          <div 
            className="absolute inset-0 rounded-full bg-green-500/20 blur-xl transition-all duration-75"
            style={{ transform: `scale(${1 + volume * 5})` }}
          />
          <div 
            className="absolute inset-0 rounded-full bg-green-400/30 blur-md transition-all duration-75"
            style={{ transform: `scale(${1 + volume * 3})` }}
          />
          
          <div className={clsx(
            "relative w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-300",
            isConnected ? "border-green-500 bg-stone-800" : "border-stone-600 bg-stone-900"
          )}>
            <Mic className={clsx(
              "w-12 h-12 transition-colors duration-300",
              isConnected ? "text-green-500" : "text-stone-500"
            )} />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-light">
            {isConnected ? "Listening for birds..." : "Connecting..."}
          </h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            {isConnected 
              ? "I'm listening to the environment. Ask me 'What bird is that?' or simply let me hear the call." 
              : "Establishing connection to acoustic model..."}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex justify-center gap-6 pb-8">
        <button 
          onClick={toggleMute}
          className={clsx(
            "p-4 rounded-full transition-all",
            isListening 
              ? "bg-stone-800 hover:bg-stone-700 text-white" 
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          )}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button 
          className="p-4 rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition-all"
        >
          <Volume2 className="w-6 h-6" />
        </button>

        <button 
          onClick={() => {
            disconnect();
            connect();
          }}
          className="p-4 rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition-all"
        >
          <Radio className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default BirdLive;
