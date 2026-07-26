import React from 'react';
import { Branding } from "@/branding";

export const ReportHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center py-6 border-b-2 border-[#1a2a6c] mb-6">
      {/* Institutional Seal / Logo Vector Representation */}
      <div className="relative w-24 h-24 mb-4" aria-label={Branding.institution}>
        <img src={Branding.logo} alt={Branding.institution} />
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-[#1a2a6c] tracking-tight uppercase">
        {Branding.institution}
      </h1>
      <h2 className="text-base md:text-lg font-semibold text-slate-700 uppercase tracking-wide mt-1">
        {Branding.school}
      </h2>
      <p className="text-sm font-medium text-[#c9a84c] tracking-widest uppercase mt-0.5">
        {Branding.committee}
      </p>
      
      <div className="w-16 h-1 bg-[#c9a84c] rounded mt-3"></div>
    </div>
  );
};
export default ReportHeader;
