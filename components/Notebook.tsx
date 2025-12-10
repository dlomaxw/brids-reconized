import React from 'react';
import { BirdSighting } from '../types';
import { Calendar, MapPin, Feather, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface NotebookProps {
  sightings: BirdSighting[];
  onRemove: (id: string) => void;
}

const Notebook: React.FC<NotebookProps> = ({ sightings, onRemove }) => {
  return (
    <div className="pb-24 p-4 min-h-screen bg-stone-50">
      <div className="flex justify-between items-center mb-6 mt-2">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Field Notebook</h2>
          <p className="text-stone-500 text-sm">{sightings.length} sightings recorded</p>
        </div>
        <button className="text-green-600 text-sm font-medium hover:text-green-700">
          Export CSV
        </button>
      </div>

      {sightings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-stone-400 bg-white rounded-2xl border border-dashed border-stone-200 p-8">
          <Feather className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium text-stone-500">No birds sighted yet.</p>
          <p className="text-sm mt-1">Start by using the Live ID or Camera.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sightings.map((sighting) => (
            <div key={sighting.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex gap-4">
              <div className="w-20 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                {sighting.imageUrl ? (
                  <img src={sighting.imageUrl} alt={sighting.speciesName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Feather className="w-8 h-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-stone-800 truncate">{sighting.speciesName}</h3>
                  <button 
                    onClick={() => onRemove(sighting.id)}
                    className="text-stone-300 hover:text-red-400 p-1 -mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 italic mb-2">{sighting.scientificName || 'Unknown species'}</p>
                
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(sighting.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{sighting.location}</span>
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                   <span className={clsx(
                     "text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide",
                     sighting.type === 'audio' ? "border-blue-200 text-blue-600 bg-blue-50" : 
                     sighting.type === 'image' ? "border-purple-200 text-purple-600 bg-purple-50" :
                     "border-stone-200 text-stone-600 bg-stone-50"
                   )}>
                     {sighting.type} ID
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notebook;
