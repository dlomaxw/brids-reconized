import React from 'react';
import { Book, Info, MapPin, Feather, Bookmark } from 'lucide-react';
import { RECOMMENDED_BOOKS } from '../constants';
import clsx from 'clsx';

const Library: React.FC = () => {
  return (
    <div className="pb-24 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="bg-amber-800 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-light mb-2">Reference <span className="font-bold">Library</span></h2>
          <p className="text-amber-200/80 text-sm">Essential guides & knowledge for East Africa</p>
        </div>
        <Book className="absolute -right-6 -bottom-8 w-48 h-48 text-amber-700/30 rotate-12" />
      </div>

      <div className="px-4 space-y-6">
        
        {/* Intro Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-start">
           <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
             <Info className="w-6 h-6" />
           </div>
           <div>
             <h3 className="font-bold text-stone-800 mb-1">Knowledge Base</h3>
             <p className="text-sm text-stone-600 leading-relaxed">
               This app is built upon the taxonomy and standards found in these essential texts. 
               For serious birders, carrying one of these physical guides is highly recommended.
             </p>
           </div>
        </div>

        <h3 className="text-lg font-bold text-stone-800 px-2 flex items-center gap-2">
           <Bookmark className="w-5 h-5 text-amber-600" />
           Recommended Reading
        </h3>

        <div className="grid gap-6">
          {RECOMMENDED_BOOKS.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row">
              {/* Fake Book Spine/Cover Representation */}
              <div className="h-32 md:h-auto md:w-32 bg-stone-200 relative flex items-center justify-center shrink-0">
                  <div className={clsx(
                    "w-20 h-28 rounded-r-md shadow-lg border-l-4 flex flex-col items-center justify-center p-2 text-center",
                    book.id === 'lib1' ? "bg-green-800 border-green-900 text-green-100" :
                    book.id === 'lib2' ? "bg-blue-800 border-blue-900 text-blue-100" :
                    book.id === 'lib3' ? "bg-amber-700 border-amber-900 text-amber-100" :
                    "bg-teal-700 border-teal-900 text-teal-100"
                  )}>
                    <div className="text-[8px] uppercase tracking-widest opacity-70 mb-1">Guide</div>
                    <Book className="w-6 h-6 mb-2 opacity-90" />
                    <div className="text-[8px] font-bold leading-tight line-clamp-2">{book.title}</div>
                  </div>
              </div>

              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-stone-900 text-lg leading-tight">{book.title}</h4>
                  <span className={clsx(
                    "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                    book.type === 'Field Guide' ? "bg-green-100 text-green-800" :
                    book.type === 'Pocket Guide' ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800"
                  )}>
                    {book.type}
                  </span>
                </div>
                
                <p className="text-xs text-stone-500 font-medium mb-3 uppercase tracking-wide">
                  {book.authors} • {book.year}
                </p>

                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {book.description}
                </p>

                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <p className="text-xs text-stone-500 font-semibold mb-1 flex items-center gap-1">
                    <Feather className="w-3 h-3" />
                    Best For:
                  </p>
                  <p className="text-xs text-stone-700">
                    {book.recommendedFor}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
           <p className="text-xs text-stone-400 italic">
             Note: Book covers are artistic representations.
           </p>
        </div>

      </div>
    </div>
  );
};

export default Library;