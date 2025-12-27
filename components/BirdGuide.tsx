import React, { useState, useRef, useEffect } from 'react';
import { Search, Feather, ChevronRight, X, Volume2, Sparkles, Loader2, StopCircle, MapPin, Trees, Globe, Activity, RefreshCw, ExternalLink, Image as ImageIcon } from 'lucide-react';
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

// Component to handle image loading and fallbacks
const BirdImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className={clsx(className, "flex items-center justify-center bg-stone-200 text-stone-400")}>
        <Feather className="w-8 h-8 opacity-50" />
      </div>
    );
  }

  return (
    <div className={clsx(className, "relative overflow-hidden bg-stone-200")}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={clsx("w-full h-full object-cover transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
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
  
  // Updated Info State
  const [updatedInfo, setUpdatedInfo] = useState<string | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  
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
        model: 'gemini-flash-lite-latest',
        contents: `Tell me one short, fascinating, 1-sentence scientific fact about the ${birdName} that a tourist would love to know. Keep it surprising and strictly under 30 words.`,
      });
      setFact(response.text || "Could not load fact.");
    } catch (e) {
      console.error(e);
      setFact("Failed to load fact.");
    } finally {
      setLoadingFact(false);
    }
  };

  const updateBirdInfo = async (birdName: string) => {
    if (!apiKey) return;
    setLoadingUpdate(true);
    setUpdatedInfo(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Using Google Search, find the very latest population numbers, conservation status updates, or interesting recent sightings for the ${birdName} in Uganda or Rwanda (2024-2025). 
        Provide a concise 3-sentence summary of the latest situation.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      setUpdatedInfo(response.text || "No recent updates found.");
    } catch (e) {
      console.error(e);
      setUpdatedInfo("Could not fetch online data.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, [selectedBird]);

  return (
    <div className="pb-24 min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-emerald-900 text-white p-6 pb-8 rounded-b-[2.5rem] shadow-xl sticky top-0 z-10">
        <h2 className="text-3xl font-light mb-1">Field <span className="font-bold text-emerald-400">Guide</span></h2>
        <p className="text-emerald-200/80 text-sm mb-4">Birds of the Albertine Rift</p>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-5 h-5 text-emerald-400 group-focus-within:text-emerald-200 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-emerald-800/50 border border-emerald-700/50 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-emerald-400/70 focus:ring-2 focus:ring-emerald-400 outline-none backdrop-blur-sm transition-all focus:bg-emerald-800"
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
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300",
              selectedCategory === cat 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105" 
                : "bg-white text-stone-500 border border-stone-100 hover:bg-emerald-50"
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
              setFact(null);
              setUpdatedInfo(null);
            }}
            className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-center hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group"
          >
            <BirdImage 
              src={bird.imageUrl} 
              alt={bird.commonName} 
              className="w-20 h-20 rounded-xl shadow-inner"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-stone-800 truncate">{bird.commonName}</h3>
                {bird.status === 'Endangered' && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" title="Endangered" />
                )}
                {bird.status === 'Endemic' && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="Endemic" />
                )}
              </div>
              <p className="text-xs text-stone-500 italic mb-2">{bird.scientificName}</p>
              <div className="flex gap-1 overflow-hidden">
                {bird.regions.map(r => (
                  <span key={r} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
          </div>
        ))}
        {filteredBirds.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <Feather className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No birds found.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBird && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={() => setSelectedBird(null)}
          />
          <div className="bg-stone-50 w-full max-w-md max-h-[95vh] overflow-y-auto rounded-t-[2.5rem] sm:rounded-[2.5rem] p-0 shadow-2xl pointer-events-auto relative animate-in slide-in-from-bottom-full duration-500">
            
            {/* Hero Image Section */}
            <div className="relative h-80 w-full group">
              <BirdImage
                src={selectedBird.imageUrl}
                alt={selectedBird.commonName}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-stone-900/10" />
              
              <button 
                onClick={() => setSelectedBird(null)}
                className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2.5 rounded-full backdrop-blur-md transition-all hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-8">
                 {/* Badges */}
                 <div className="flex flex-wrap gap-2 mb-3">
                  {selectedBird.status === 'Endemic' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg shadow-amber-900/20 backdrop-blur-md">
                      Regional Endemic
                    </span>
                  )}
                  {selectedBird.status === 'Endangered' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg shadow-red-900/20 backdrop-blur-md animate-pulse">
                      Endangered
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10">
                    {selectedBird.size}
                  </span>
                </div>

                <h2 className="text-4xl font-bold text-white leading-tight mb-1 drop-shadow-md">{selectedBird.commonName}</h2>
                <p className="text-stone-300 italic font-serif text-lg tracking-wide">{selectedBird.scientificName}</p>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 space-y-6">
              
              {/* Description Card */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Identification</h3>
                  </div>
                  <button 
                    onClick={() => playDescription(selectedBird.description)}
                    disabled={loadingAudio}
                    className={clsx(
                      "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm",
                      isPlaying 
                        ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100" 
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:scale-105"
                    )}
                  >
                    {loadingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                     isPlaying ? <StopCircle className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {isPlaying ? "Stop" : "Listen"}
                  </button>
                </div>
                <p className="text-stone-600 leading-relaxed text-[15px] font-normal relative z-10">
                  {selectedBird.description}
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-10 -mt-10" />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4">
                 
                 {/* Habitat Card */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
                   <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shrink-0">
                     <Trees className="w-6 h-6" />
                   </div>
                   <div>
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Habitat</span>
                     <p className="text-stone-800 text-sm font-semibold leading-relaxed">{selectedBird.habitat}</p>
                   </div>
                 </div>

                 {/* Geographical Distribution Card */}
                 <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex items-start gap-4 hover:border-blue-200 transition-colors">
                   <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 shrink-0">
                     <MapPin className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Distribution</span>
                     <p className="text-stone-800 text-sm font-semibold leading-relaxed mb-3">{selectedBird.distribution}</p>
                     
                     <div className="flex flex-wrap gap-2">
                        {selectedBird.regions.map(r => (
                          <span key={r} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-stone-50 border border-stone-100 text-stone-500 uppercase tracking-wide flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {r}
                          </span>
                        ))}
                     </div>
                   </div>
                 </div>

                 {/* Conservation Status Card */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-stone-400" />
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">IUCN Status</span>
                      </div>
                      <span className={clsx(
                        "text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wide",
                        IUCN_COLORS[selectedBird.iucnStatus]
                      )}>
                        {selectedBird.iucnStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-stone-800">{IUCN_LABELS[selectedBird.iucnStatus]}</span>
                    </div>
                    
                    {/* Status Bar */}
                    <div className="h-2 w-full bg-stone-100 rounded-full flex gap-1 overflow-hidden">
                      {['LC', 'NT', 'VU', 'EN', 'CR'].map((status) => {
                         const isActive = status === selectedBird.iucnStatus;
                         let colorClass = "bg-stone-200";
                         if (isActive) colorClass = IUCN_BAR_COLORS[status];
                         
                         return (
                          <div 
                            key={status} 
                            className={clsx(
                              "flex-1 rounded-full transition-all duration-300",
                              colorClass,
                              isActive ? "opacity-100" : "opacity-30"
                            )}
                          />
                         );
                      })}
                    </div>
                 </div>

              </div>

              {/* AI Features Container */}
              <div className="space-y-4">
                
                {/* Fact Card */}
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest">Did you know?</h4>
                      </div>
                      {fact && (
                        <button 
                          onClick={() => generateFact(selectedBird.commonName)}
                          disabled={loadingFact}
                          className="p-1.5 rounded-full hover:bg-amber-100 text-amber-700 transition-colors"
                        >
                          <RefreshCw className={clsx("w-3.5 h-3.5", loadingFact && "animate-spin")} />
                        </button>
                      )}
                    </div>
                    {fact && !loadingFact ? (
                      <p className="text-sm text-stone-800 italic animate-in fade-in leading-relaxed font-medium">"{fact}"</p>
                    ) : loadingFact ? (
                      <div className="flex items-center gap-2 text-sm text-amber-800/60 italic py-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Finding a fun fact...</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => generateFact(selectedBird.commonName)}
                        className="w-full text-left py-2 px-1 rounded-lg text-sm text-amber-800/80 hover:text-amber-900 font-bold flex items-center gap-2 transition-colors hover:bg-amber-100/50"
                      >
                        Reveal a scientific fact...
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Grounding Live Update Card */}
                <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-600" />
                        <h4 className="text-xs font-bold text-sky-800 uppercase tracking-widest">Live Updates</h4>
                      </div>
                    </div>
                    
                    {updatedInfo && !loadingUpdate ? (
                      <div className="space-y-3 animate-in fade-in">
                          <p className="text-sm text-stone-800 leading-relaxed border-l-2 border-sky-300 pl-3">
                            {updatedInfo}
                          </p>
                          <div className="flex justify-end">
                             <span className="text-[10px] text-sky-500 font-medium">Source: Google Search Grounding</span>
                          </div>
                      </div>
                    ) : loadingUpdate ? (
                      <div className="flex items-center gap-2 text-sm text-sky-800/60 italic py-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching latest reports...</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => updateBirdInfo(selectedBird.commonName)}
                        className="w-full text-left py-2 px-1 rounded-lg text-sm text-sky-800/80 hover:text-sky-900 font-bold flex items-center gap-2 transition-colors hover:bg-sky-100/50"
                      >
                        Fetch latest 2024-2025 status...
                      </button>
                    )}
                  </div>
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