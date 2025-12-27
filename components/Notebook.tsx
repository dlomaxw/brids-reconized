import React, { useState, useEffect } from 'react';
import { BirdSighting } from '../types';
import { Calendar, MapPin, Feather, Trash2, PieChart, Sparkles, Loader2, Save } from 'lucide-react';
import clsx from 'clsx';
import { GoogleGenAI } from '@google/genai';

interface NotebookProps {
  sightings: BirdSighting[];
  onRemove: (id: string) => void;
}

const STORAGE_KEY = 'birding_guide_sightings';

const Notebook: React.FC<NotebookProps> = ({ sightings, onRemove }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const apiKey = process.env.API_KEY || '';

  // Save sightings whenever they change (this logic might ideally be in App.tsx, but for simplicity we rely on the passed prop having been updated by App.tsx)
  // However, to ensure persistence, App.tsx should handle the load/save.
  // We will assume App.tsx is handling the state and passing it down.

  const analyzeNotebook = async () => {
    if (sightings.length === 0 || !apiKey) return;
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Here is a list of bird sightings from a user's field notebook in Uganda/Rwanda: 
      ${JSON.stringify(sightings.map(s => ({ species: s.speciesName, loc: s.location, date: new Date(s.timestamp).toDateString() })))}
      
      Analyze this list and provide:
      1. A brief summary of the user's birding activity.
      2. One interesting ecological pattern connecting these species.
      3. A suggestion for a future sighting based on what they have already seen.
      
      Keep it encouraging and scientific. Max 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAnalysis(response.text);
    } catch (e) {
      console.error(e);
      setAnalysis("Could not generate analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="pb-24 p-4 min-h-screen bg-stone-50">
      <div className="flex justify-between items-center mb-6 mt-2 sticky top-0 bg-stone-50 z-10 py-2">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">Field Notebook</h2>
          <p className="text-stone-500 text-sm font-medium">{sightings.length} sightings recorded</p>
        </div>
        {sightings.length > 0 && (
          <button 
            onClick={analyzeNotebook}
            disabled={analyzing}
            className="flex items-center gap-2 text-xs font-bold bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
          >
             {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
             AI Insights
          </button>
        )}
      </div>

      {analysis && (
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
               <PieChart className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-amber-800 text-sm">Ornithologist's Report</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{analysis}</p>
          <button onClick={() => setAnalysis(null)} className="text-xs text-amber-600 font-bold underline mt-3 hover:text-amber-800">Dismiss</button>
        </div>
      )}

      {sightings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-stone-400 bg-white rounded-3xl border-2 border-dashed border-stone-200 p-8 m-2">
          <div className="bg-stone-50 p-4 rounded-full mb-4">
             <Feather className="w-12 h-12 opacity-30" />
          </div>
          <p className="font-bold text-lg text-stone-500">Your notebook is empty</p>
          <p className="text-sm mt-2 max-w-xs leading-relaxed">Start your journey by identifying birds using the Live Audio ID or Camera.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sightings.map((sighting) => (
            <div key={sighting.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 transition-all hover:shadow-md">
              <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-100">
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
                  <h3 className="font-bold text-stone-800 truncate text-lg">{sighting.speciesName}</h3>
                  <button 
                    onClick={() => onRemove(sighting.id)}
                    className="text-stone-300 hover:text-red-400 p-1.5 hover:bg-red-50 rounded-full transition-colors -mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-stone-500 italic mb-3 font-medium">{sighting.scientificName || 'Unknown species'}</p>
                
                <div className="flex flex-wrap gap-3 text-xs text-stone-400">
                  <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(sighting.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{sighting.location}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                   <span className={clsx(
                     "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border",
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