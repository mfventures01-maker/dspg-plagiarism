import React from 'react';

import { Branding } from '@/branding';

export const ReportFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="w-full text-center py-6 border-t border-slate-200 mt-12 text-xs text-slate-500">
      <p className="font-semibold text-slate-700">
        {Branding.institution} &bull; {Branding.school}
      </p>
      <p className="mt-1">
        {Branding.committee} Academic Integrity Report &bull; {Branding.version}
      </p>
      <p className="mt-2 text-[10px] text-slate-400">
        {Branding.copyright} {currentYear}. This document complies with the National Board for Technical Education (NBTE) and NITDA academic integrity standards.
      </p>
    </div>
  );
};
export default ReportFooter;
