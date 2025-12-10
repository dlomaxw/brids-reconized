import React, { useState } from 'react';
import { Home, Camera, Mic, BookOpen, Map, Feather } from 'lucide-react';
import { AppView, BirdSighting } from './types';
import HotspotsList from './components/HotspotsList';
import Notebook from './components/Notebook';
import PhotoID from './components/PhotoID';
import BirdLive from './components/BirdLive';
import BirdGuide from './components/BirdGuide';
import clsx from 'clsx';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [sightings, setSightings] = useState<BirdSighting[]>([]);
  const [showLiveModal, setShowLiveModal] = useState(false);

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
      case AppView.HOME:
      default:
        return (
          <div className="p-6 pb-24 space-y-8">
            <header className="mt-8">
              <h1 className="text-4xl font-light text-stone-800">
                Jambo, <span className="font-bold text-green-700">Explorer</span>
              </h1>
              <p className="text-stone-500 mt-2">Ready to discover the birds of the Rift Valley?</p>
            </header>

            {/* Main Action Cards */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowLiveModal(true)}
                className="col-span-2 bg-stone-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center gap-4 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Live Audio ID</h3>
                  <p className="text-stone-400 text-sm">Tap to listen & identify calls</p>
                </div>
              </button>

              <button 
                onClick={() => setView(AppView.PHOTO_ID)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-semibold text-stone-700">Photo ID</span>
              </button>

              <button 
                onClick={() => setView(AppView.BIRD_GUIDE)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-600">
                  <Feather className="w-6 h-6" />
                </div>
                <span className="font-semibold text-stone-700">Bird Guide</span>
              </button>

              <button 
                onClick={() => setView(AppView.HOTSPOTS)}
                className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center justify-between hover:bg-stone-50 transition-colors px-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Map className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-stone-700">Hotspots</span>
                    <span className="text-xs text-stone-400">Discover top sites</span>
                  </div>
                </div>
                <Map className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h4 className="text-green-800 font-semibold mb-4">Your Trip Stats</h4>
              <div className="flex justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{sightings.length}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide">Sightings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{sightings.filter(s => s.type === 'audio').length}</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide">Audio IDs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">4</div>
                  <div className="text-xs text-green-600 uppercase tracking-wide">Hotspots</div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Content Area */}
      <div className="h-full overflow-y-auto scrollbar-hide">
        {renderContent()}
      </div>

      {/* Live Bird Assistant Modal */}
      {showLiveModal && (
        <BirdLive onClose={() => setShowLiveModal(false)} />
      )}

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-4 flex justify-between items-center z-40">
        <button 
          onClick={() => setView(AppView.HOME)}
          className={clsx("flex flex-col items-center gap-1 transition-colors", view === AppView.HOME ? "text-green-700" : "text-stone-400 hover:text-stone-600")}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        
        <button 
          onClick={() => setView(AppView.HOTSPOTS)}
          className={clsx("flex flex-col items-center gap-1 transition-colors", view === AppView.HOTSPOTS ? "text-green-700" : "text-stone-400 hover:text-stone-600")}
        >
          <Map className="w-6 h-6" />
          <span className="text-[10px] font-medium">Map</span>
        </button>

        {/* Floating Action Button for Live ID */}
        <button 
          onClick={() => setShowLiveModal(true)}
          className="relative -top-6 bg-stone-900 text-white p-4 rounded-full shadow-lg shadow-stone-400/50 hover:bg-stone-800 transition-transform active:scale-95 border-4 border-stone-50"
        >
          <Mic className="w-7 h-7" />
        </button>

        <button 
          onClick={() => setView(AppView.PHOTO_ID)}
          className={clsx("flex flex-col items-center gap-1 transition-colors", view === AppView.PHOTO_ID ? "text-green-700" : "text-stone-400 hover:text-stone-600")}
        >
          <Camera className="w-6 h-6" />
          <span className="text-[10px] font-medium">Camera</span>
        </button>

        <button 
          onClick={() => setView(AppView.NOTEBOOK)}
          className={clsx("flex flex-col items-center gap-1 transition-colors", view === AppView.NOTEBOOK ? "text-green-700" : "text-stone-400 hover:text-stone-600")}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-medium">Notebook</span>
        </button>
      </nav>
    </div>
  );
};

export default App;