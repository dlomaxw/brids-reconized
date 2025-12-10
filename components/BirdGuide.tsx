import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Feather, ChevronRight, X, Volume2, Sparkles, Loader2, StopCircle, MapPin, Trees, Globe, Info, Activity } from 'lucide-react';
import { BIRD_SPECIES } from '../constants';
import clsx from 'clsx';
import { BirdSpecies } from '../types';
import { GoogleGenAI, Modality } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audioStreamer';

const CATEGORIES = ['All', 'Waterbird', 'Raptor', 'Forest', 'Savannah'];

const IUCN_COLORS: Record<string, string> = {
  'LC': 'bg-green-100 text-green-800 border-green-200',
  'NT': 'bg-lime-100 text-lime-800 border-lime-200',
  'VU': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'EN': 'bg-orange-100 text-orange-800 border-orange-200',
  'CR': 'bg-red-100 text-red-800 border-red-200',
};

const IUCN_BAR_COLORS: Record<string, string> = {
  'LC': 'bg-green-500',
  'NT': 'bg-lime-500',
  'VU': 'bg-yellow-500',
  'EN': 'bg-orange-500',
  'CR': 'bg-red-600',
};

const IUCN_LABELS: Record<string, string> = {
  'LC': 'Least Concern',
  'NT': 'Near Threatened',
  'VU': 'Vulnerable',
  'EN': 'Endangered',
  'CR': 'Critically Endangered',
};

const BirdGuide: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBird, setSelectedBird] = useState<BirdSpecies | null>(null);
  
  // AI Features State
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [fact, setFact] = useState<string | null>(null);
  const [loadingFact, setLoadingFact] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const apiKey = process.env.API_KEY || '';

  const filteredBirds = BIRD_SPECIES.filter(bird => {
    const matchesSearch = bird.commonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bird.colors.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || bird.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch (e) {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playDescription = async (text: string) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!apiKey) return;

    setLoadingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        const audioBuffer = await decodeAudioData(
          decode(audioData),
          ctx,
          24000,
          1
        );

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        
        sourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (e) {
      console.error(e);
      alert("Could not generate speech.");
    } finally {
      setLoadingAudio(false);
    }
  };

  const generateFact = async (birdName: string) => {
    if (!apiKey) return;
    setLoadingFact(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest', // Fast AI for quick facts
        contents: `Tell me one short, fascinating, 1-sentence scientific fact about the ${birdName} that a tourist would love to know.`,
      });
      setFact(response.text || "Could not load fact.");
    } catch (e) {
      console.error(e);
      setFact("Failed to load fact.");
    } finally {
      setLoadingFact(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount or modal close
    return () => stopAudio();
  }, [selectedBird]);

  return (
    <div className="pb-24 min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-900 text-white p-6 pb-8 rounded-b-[2rem] shadow-lg sticky top-0 z-10">
        <h2 className="text-3xl font-light mb-1">Field <span className="font-bold text-green-400">Guide</span></h2>
        <p className="text-stone-400 text-sm mb-4">Birds of Uganda & Rwanda</p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
          <input 
            type="text"
            placeholder="Search by name or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-800 border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder-stone-500 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              selectedCategory === cat 
                ? "bg-green-700 text-white shadow-md shadow-green-200" 
                : "bg-white text-stone-600 border border-stone-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {filteredBirds.map(bird => (
          <div 
            key={bird.id}
            onClick={() => {
              setSelectedBird(bird);
              setFact(null); // Reset fact
            }}
            className="bg-white p-3 rounded-xl shadow-sm border border-stone-100 flex gap-4 items-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <img 
              src={bird.imageUrl} 
              alt={bird.commonName} 
              className="w-16 h-16 rounded-lg object-cover bg-stone-100"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-stone-800">{bird.commonName}</h3>
                {bird.status === 'Endangered' && (
                  <span className="w-2 h-2 rounded-full bg-red-500" title="Endangered" />
                )}
                {bird.status === 'Endemic' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title="Endemic" />
                )}
              </div>
              <p className="text-xs text-stone-500 italic">{bird.scientificName}</p>
              <div className="flex gap-1 mt-1">
                {bird.regions.map(r => (
                  <span key={r} className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300" />
          </div>
        ))}
        {filteredBirds.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <Feather className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No birds found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBird && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setSelectedBird(null)}
          />
          <div className="bg-stone-50 w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-0 shadow-2xl pointer-events-auto relative animate-in slide-in-from-bottom-full duration-300">
            
            {/* Hero Image Section */}
            <div className="relative h-72 w-full">
              <img 
                src={selectedBird.imageUrl} 
                alt={selectedBird.commonName} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
              
              <button 
                onClick={() => setSelectedBird(null)}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                 {/* Badges */}
                 <div className="flex flex-wrap gap-2 mb-3">
                  {selectedBird.status === 'Endemic' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                      Regional Endemic
                    </span>
                  )}
                  {selectedBird.status === 'Endangered' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                      Endangered
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10">
                    {selectedBird.size}
                  </span>
                </div>

                <h2 className="text-3xl font-bold text-white leading-tight mb-1">{selectedBird.commonName}</h2>
                <p className="text-stone-300 italic font-serif text-lg">{selectedBird.scientificName}</p>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-5 space-y-4">
              
              {/* Description Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-stone-400" />
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Description</h3>
                  </div>
                  <button 
                    onClick={() => playDescription(selectedBird.description)}
                    disabled={loadingAudio}
                    className={clsx(
                      "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
                      isPlaying 
                        ? "bg-red-50 text-red-600 border border-red-100" 
                        : "bg-green-50 text-green-700 border border-green-100 hover:bg-green-100"
                    )}
                  >
                    {loadingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                     isPlaying ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isPlaying ? "Stop Audio" : "Listen"}
                  </button>
                </div>
                <p className="text-stone-700 leading-relaxed text-[15px] font-light">
                  {selectedBird.description}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4">
                 
                 {/* Habitat Card */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4">
                   <div className="bg-green-50 p-2.5 rounded-xl text-green-600 shrink-0">
                     <Trees className="w-6 h-6" />
                   </div>
                   <div>
                     <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Habitat</span>
                     <p className="text-stone-800 text-sm font-medium leading-snug">{selectedBird.habitat}</p>
                   </div>
                 </div>

                 {/* Distribution Card */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4">
                   <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 shrink-0">
                     <MapPin className="w-6 h-6" />
                   </div>
                   <div>
                     <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1">Distribution</span>
                     <p className="text-stone-800 text-sm font-medium leading-snug">{selectedBird.distribution}</p>
                   </div>
                 </div>

                 {/* Conservation Status Card */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-stone-400" />
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Conservation Status</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-stone-800">{IUCN_LABELS[selectedBird.iucnStatus]}</span>
                      <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded border uppercase",
                        IUCN_COLORS[selectedBird.iucnStatus]
                      )}>
                        IUCN: {selectedBird.iucnStatus}
                      </span>
                    </div>
                    
                    {/* Status Bar */}
                    <div className="h-2.5 w-full bg-stone-100 rounded-full flex gap-0.5 overflow-hidden">
                      {['LC', 'NT', 'VU', 'EN', 'CR'].map((status) => {
                         const isActive = status === selectedBird.iucnStatus;
                         return (
                          <div 
                            key={status} 
                            className={clsx(
                              "flex-1 transition-all duration-300",
                              isActive ? IUCN_BAR_COLORS[status] : "bg-stone-200 opacity-30"
                            )}
                          />
                         );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-medium px-0.5">
                      <span>LC</span>
                      <span>CR</span>
                    </div>
                 </div>

              </div>

              {/* AI Fact Card */}
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Sparkles className="w-16 h-16 text-amber-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Did you know?</h4>
                  </div>
                  {fact ? (
                     <p className="text-sm text-stone-800 italic animate-in fade-in leading-relaxed">"{fact}"</p>
                  ) : (
                    <button 
                      onClick={() => generateFact(selectedBird.commonName)}
                      disabled={loadingFact}
                      className="w-full text-left py-2 px-1 rounded-lg text-sm text-amber-800/80 hover:text-amber-900 font-medium flex items-center gap-2 transition-colors hover:bg-amber-100/50"
                    >
                      {loadingFact ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tap to reveal a fascinating scientific fact..."}
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Spacer */}
              <div className="h-6" />
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BirdGuide;