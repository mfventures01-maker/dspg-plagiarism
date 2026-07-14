import React from 'react';

export const ReportFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="w-full text-center py-6 border-t border-slate-200 mt-12 text-xs text-slate-500">
      <p className="font-semibold text-slate-700">
        Delta State Polytechnic Ogwashi-Uku &bull; School of Engineering
      </p>
      <p className="mt-1">
        HND Projects Committee Plagiarism Checker Report &bull; v1.0.0
      </p>
      <p className="mt-2 text-[10px] text-slate-400">
        &copy; {currentYear} DSPG. This document complies with the National Board for Technical Education (NBTE) and NITDA academic integrity standards.
      </p>
    </div>
  );
};
export default ReportFooter;
