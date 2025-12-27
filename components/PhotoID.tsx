import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { BirdSighting } from '../types';
import clsx from 'clsx';

interface PhotoIDProps {
  onIdentify: (sighting: BirdSighting) => void;
}

const PhotoID: React.FC<PhotoIDProps> = ({ onIdentify }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiKey = process.env.API_KEY || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyBird = async () => {
    if (!image || !apiKey) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Dynamic MIME type extraction
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("Invalid image format");
      }
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded to Pro for better image analysis
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: `Identify the bird in this image. The location is likely Uganda or Rwanda. 
              Return a JSON object with: 
              - speciesName (string)
              - scientificName (string)
              - confidence (number 0-1)
              - description (string, max 2 sentences)
              - isEndemic (boolean)
              `
            }
          ]
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      let text = response.text;
      if (text) {
        // Sanitize Markdown code blocks if present
        if (text.startsWith('```')) {
           text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
        }

        const data = JSON.parse(text);
        setResult(data);
        
        // Auto-save to notebook
        onIdentify({
          id: Date.now().toString(),
          speciesName: data.speciesName,
          scientificName: data.scientificName,
          location: 'Unknown Location', // In a real app, use Geolocation API here
          timestamp: Date.now(),
          confidence: data.confidence,
          imageUrl: image,
          type: 'image',
          notes: data.description
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to identify bird. Please try again or use a clearer image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-stone-800">Visual ID</h2>
        <p className="text-stone-500 text-sm">Snap a photo or upload to identify species.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {image ? (
          <div className="relative">
             <img src={image} alt="Preview" className="w-full h-64 object-cover" />
             <button 
               onClick={() => setImage(null)}
               className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
             >
               <AlertCircle className="w-5 h-5 rotate-45" />
             </button>
          </div>
        ) : (
          <div className="h-64 bg-stone-100 flex flex-col items-center justify-center gap-4 border-b border-stone-100">
            <Camera className="w-12 h-12 text-stone-300" />
            <p className="text-stone-400 text-sm">No image selected</p>
          </div>
        )}

        <div className="p-4 grid grid-cols-2 gap-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload
          </button>
          <button 
            onClick={identifyBird}
            disabled={!image || loading}
            className={clsx(
              "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors text-white",
              !image || loading ? "bg-stone-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-md shadow-green-200"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Identify
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-900">{result.speciesName}</h3>
              <p className="text-stone-500 italic text-sm">{result.scientificName}</p>
            </div>
            <span className={clsx(
              "px-3 py-1 rounded-full text-xs font-semibold",
              result.confidence > 0.8 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            )}>
              {Math.round(result.confidence * 100)}% Match
            </span>
          </div>
          
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            {result.description}
          </p>

          {result.isEndemic && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">
              <AlertCircle className="w-3.5 h-3.5" />
              Regional Endemic
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoID;