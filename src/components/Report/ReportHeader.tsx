import React from 'react';

export const ReportHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-6 border-b-2 border-[#1a2a6c] mb-6">
      {/* Institutional Seal / Logo Vector Representation */}
      <div className="relative w-24 h-24 mb-4" aria-label="Delta State Polytechnic Ogwashi-Uku Logo">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="#1a2a6c" strokeWidth="3" />
          {/* Inner Golden Ring */}
          <circle cx="50" cy="50" r="41" fill="none" stroke="#c9a84c" strokeWidth="2" />
          
          {/* Core Shape (Shield / Crest) */}
          <path d="M 50 18 C 58 18, 68 25, 68 40 C 68 62, 50 78, 50 82 C 50 78, 32 62, 32 40 C 32 25, 42 18, 50 18 Z" fill="#1a2a6c" />
          
          {/* Torch/Flame representing Knowledge */}
          <path d="M 46 60 Q 50 45, 54 60 Z" fill="#c9a84c" />
          <path d="M 50 48 Q 50 35, 47 38 Q 53 30, 53 38 Z" fill="#ef4444" />
          
          {/* Open Book representing Education */}
          <path d="M 37 54 C 42 50, 48 52, 50 54 C 52 52, 58 50, 63 54 L 63 44 C 58 41, 52 43, 50 44 C 48 43, 42 41, 37 44 Z" fill="#ffffff" />
          
          {/* Star decorations */}
          <polygon points="50,11 51,13 54,13 52,15 53,17 50,16 47,17 48,15 46,13 49,13" fill="#c9a84c" />
        </svg>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-[#1a2a6c] tracking-tight uppercase">
        Delta State Polytechnic Ogwashi-Uku
      </h1>
      <h2 className="text-base md:text-lg font-semibold text-slate-700 uppercase tracking-wide mt-1">
        School of Engineering
      </h2>
      <p className="text-sm font-medium text-[#c9a84c] tracking-widest uppercase mt-0.5">
        HND Projects Committee
      </p>
      
      <div className="w-16 h-1 bg-[#c9a84c] rounded mt-3"></div>
    </div>
  );
};
export default ReportHeader;
