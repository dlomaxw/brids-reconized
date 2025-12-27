import React, { useState, useEffect } from 'react';
import { Home, Camera, Mic, BookOpen, Map, Feather, MessageCircle, Library as LibraryIcon } from 'lucide-react';
import { AppView, BirdSighting } from './types';
import HotspotsList from './components/HotspotsList';
import Notebook from './components/Notebook';
import PhotoID from './components/PhotoID';
import BirdLive from './components/BirdLive';
import BirdGuide from './components/BirdGuide';
import ChatBot from './components/ChatBot';
import Library from './components/Library';
import clsx from 'clsx';

const SIGHTINGS_STORAGE_KEY = 'birding_guide_sightings';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [sightings, setSightings] = useState<BirdSighting[]>([]);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Load sightings on mount
  useEffect(() => {
    const saved = localStorage.getItem(SIGHTINGS_STORAGE_KEY);
    if (saved) {
      try {
        setSightings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sightings");
      }
    }
  }, []);

  // Save sightings on change
  useEffect(() => {
    localStorage.setItem(SIGHTINGS_STORAGE_KEY, JSON.stringify(sightings));
  }, [sightings]);

  const addSighting = (sighting: BirdSighting) => {
    setSightings(prev => [sighting, ...prev]);
    setView(AppView.NOTEBOOK);
  };

  const removeSighting = (id: string) => {
    setSightings(prev => prev.filter(s => s.id !== id));
  };

  // Determine current content
  const renderContent = () => {
    switch (view) {
      case AppView.HOTSPOTS:
        return <HotspotsList />;
      case AppView.NOTEBOOK:
        return <Notebook sightings={sightings} onRemove={removeSighting} />;
      case AppView.PHOTO_ID:
        return <PhotoID onIdentify={addSighting} />;
      case AppView.BIRD_GUIDE:
        return <BirdGuide />;
      case AppView.CHAT:
        return <ChatBot />;
      case AppView.LIBRARY:
        return <Library />;
      case AppView.HOME:
      default:
        return (
          <div className="p-6 pb-24 space-y-8 animate-in fade-in duration-500">
            <header className="mt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Rift Valley Edition
              </div>
              <h1 className="text-4xl font-light text-stone-800 tracking-tight">
                Jambo, <span className="font-bold text-emerald-700">Explorer</span>
              </h1>
              <p className="text-stone-500 mt-2 text-lg">Ready to discover the birds of Uganda & Rwanda?</p>
            </header>

            {/* Main Action Cards */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowLiveModal(true)}
                className="col-span-2 bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 rounded-[2rem] shadow-xl shadow-stone-300 flex flex-col items-center gap-4 hover:scale-[1.02] transition-all active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                  <Mic className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold tracking-tight">Live Audio ID</h3>
                  <p className="text-stone-400 text-sm font-medium">Tap to listen & identify calls</p>
                </div>
              </button>

              <button 
                onClick={() => setView(AppView.PHOTO_ID)}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <span className="font-bold text-stone-700">Photo ID</span>
              </button>

              <button 
                onClick={() => setView(AppView.BIRD_GUIDE)}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Feather className="w-7 h-7" />
                </div>
                <span className="font-bold text-stone-700">Bird Guide</span>
              </button>

              <button 
                onClick={() => setView(AppView.CHAT)}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="font-bold text-stone-700">AI Guide</span>
              </button>

               <button 
                onClick={() => setView(AppView.LIBRARY)}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
                  <LibraryIcon className="w-7 h-7" />
                </div>
                <span className="font-bold text-stone-700">Library</span>
              </button>

              <button 
                onClick={() => setView(AppView.HOTSPOTS)}
                className="col-span-2 bg-emerald-700 text-white p-6 rounded-[2rem] shadow-lg shadow-emerald-200 flex items-center justify-between hover:bg-emerald-800 transition-colors px-8 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                    <Map className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold text-lg">Hotspots</span>
                    <span className="text-emerald-200 text-sm">Explore top sites</span>
                  </div>
                </div>
                <Map className="w-6 h-6 text-emerald-200 group-hover:translate-x-1 transition-transform relative z-10" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-stone-100 rounded-3xl p-6 border border-stone-200">
              <h4 className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-4">Your Field Stats</h4>
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">{sightings.length}</div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1">Sightings</div>
                </div>
                <div className="w-px bg-stone-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">{sightings.filter(s => s.type === 'audio').length}</div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1">Audio IDs</div>
                </div>
                <div className="w-px bg-stone-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">8</div>
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wide mt-1">Hotspots</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Content Area */}
      <div className="h-full overflow-y-auto scrollbar-hide bg-stone-50">
        {renderContent()}
      </div>

      {/* Live Bird Assistant Modal */}
      {showLiveModal && (
        <BirdLive onClose={() => setShowLiveModal(false)} />
      )}

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-6 py-4 flex justify-between items-end z-40 pb-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setView(AppView.HOME)}
          className={clsx("flex flex-col items-center gap-1 transition-all duration-300 w-12", view === AppView.HOME ? "text-emerald-700 -translate-y-1" : "text-stone-400 hover:text-stone-600")}
        >
          <Home className={clsx("w-6 h-6", view === AppView.HOME && "fill-current")} />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        
        <button 
          onClick={() => setView(AppView.CHAT)}
          className={clsx("flex flex-col items-center gap-1 transition-all duration-300 w-12", view === AppView.CHAT ? "text-emerald-700 -translate-y-1" : "text-stone-400 hover:text-stone-600")}
        >
          <MessageCircle className={clsx("w-6 h-6", view === AppView.CHAT && "fill-current")} />
          <span className="text-[10px] font-bold">Chat</span>
        </button>

        {/* Floating Action Button for Live ID */}
        <button 
          onClick={() => setShowLiveModal(true)}
          className="relative -top-8 bg-stone-900 text-white p-5 rounded-full shadow-xl shadow-stone-900/30 hover:bg-stone-800 transition-all hover:scale-105 active:scale-95 border-[6px] border-stone-50"
        >
          <Mic className="w-8 h-8" />
        </button>

        <button 
          onClick={() => setView(AppView.PHOTO_ID)}
          className={clsx("flex flex-col items-center gap-1 transition-all duration-300 w-12", view === AppView.PHOTO_ID ? "text-emerald-700 -translate-y-1" : "text-stone-400 hover:text-stone-600")}
        >
          <Camera className={clsx("w-6 h-6", view === AppView.PHOTO_ID && "fill-current")} />
          <span className="text-[10px] font-bold">Camera</span>
        </button>

        <button 
          onClick={() => setView(AppView.NOTEBOOK)}
          className={clsx("flex flex-col items-center gap-1 transition-all duration-300 w-12", view === AppView.NOTEBOOK ? "text-emerald-700 -translate-y-1" : "text-stone-400 hover:text-stone-600")}
        >
          <BookOpen className={clsx("w-6 h-6", view === AppView.NOTEBOOK && "fill-current")} />
          <span className="text-[10px] font-bold">Notes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;