import React, { useState } from 'react';
import { MapPin, Mountain, Wind, Map as MapIcon, Loader2, X, Compass } from 'lucide-react';
import { HOTSPOTS } from '../constants';
import clsx from 'clsx';
import { GoogleGenAI } from '@google/genai';

const HotspotsList: React.FC = () => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [tripInfo, setTripInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const apiKey = process.env.API_KEY || '';

  const getTripInfo = async (hotspot: typeof HOTSPOTS[0]) => {
    if (!apiKey) return;
    setLoading(true);
    setTripInfo(null);
    setSelectedHotspot(hotspot.id);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I am a birdwatcher planning a trip to ${hotspot.name} in ${hotspot.country}. 
        Provide a concise 3-bullet point summary including:
        1. Best way to get there from the capital city.
        2. One recent review or tip from other travelers.
        3. Current birding conditions or best time of year.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: { 
            retrievalConfig: { 
              latLng: { latitude: hotspot.coordinates.lat, longitude: hotspot.coordinates.lng } 
            } 
          }
        },
      });
      
      setTripInfo(response.text || "No information found.");
    } catch (e) {
      console.error(e);
      setTripInfo("Could not connect to Maps data.");
    } finally {
      setLoading(false);
    }
  };

  const closeTripInfo = () => {
    setSelectedHotspot(null);
    setTripInfo(null);
  };

  return (
    <div className="pb-24">
      <div className="bg-green-700 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Explore</h2>
          <p className="text-green-100">Top birding sites in the Albertine Rift</p>
        </div>
        <Mountain className="absolute -right-8 -bottom-12 w-64 h-64 text-green-600/30 rotate-12" />
      </div>

      <div className="px-4 space-y-4">
        {HOTSPOTS.map((spot) => (
          <div key={spot.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-md transition-shadow group">
            <div className="h-40 overflow-hidden relative">
              <img 
                src={spot.imageUrl} 
                alt={spot.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-stone-700 uppercase tracking-wide">
                {spot.country}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-stone-800 leading-tight">{spot.name}</h3>
                <span className={clsx(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  spot.difficulty === 'Easy' ? "bg-green-100 text-green-700" :
                  spot.difficulty === 'Moderate' ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                )}>{spot.difficulty}</span>
              </div>
              
              <p className="text-stone-500 text-sm mb-4 line-clamp-2">{spot.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {spot.keySpecies.map((bird, i) => (
                  <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                    {bird}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex items-center gap-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{spot.coordinates.lat.toFixed(3)}, {spot.coordinates.lng.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>Best: Morning</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => getTripInfo(spot)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Plan Trip
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maps Grounding Info Modal */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={closeTripInfo}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <MapIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-stone-800">Trip Planner</h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-stone-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-green-600" />
                <p className="text-sm">Fetching Maps data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="prose prose-sm prose-stone">
                    {tripInfo ? (
                      <div className="text-sm text-stone-600 whitespace-pre-line leading-relaxed">
                        {tripInfo}
                      </div>
                    ) : (
                      <p className="text-sm text-red-500">Failed to load trip info.</p>
                    )}
                 </div>
                 
                 <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                   <p className="text-[10px] text-blue-600 flex items-center gap-1">
                     <MapPin className="w-3 h-3" />
                     Data provided by Google Maps Grounding
                   </p>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotspotsList;