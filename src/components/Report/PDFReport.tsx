/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalysisState, CommitteeData } from '../../types';
import { ReportHeader } from './ReportHeader';
import { ReportFooter } from './ReportFooter';
import { CheckCircle2, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { Branding } from '../../branding';

interface PDFReportProps {
  analysis: AnalysisState;
  committee: CommitteeData;
  chairmanValidated: boolean;
  secretaryValidated: boolean;
}

export const PDFReport: React.FC<PDFReportProps> = ({
  analysis,
  committee,
  chairmanValidated,
  secretaryValidated
}) => {
  const result = analysis.normalizedDoc;

  return (
    <div className="space-y-8 bg-slate-200 p-4 md:p-8 rounded-2xl max-h-[800px] overflow-y-auto shadow-inner border border-slate-300">
      <div className="flex items-center justify-between px-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
        <span>Report Preview Panel</span>
        <span className="flex items-center gap-1 text-[#1a2a6c]">
          <Lock className="h-3 w-3" /> Live Simulator
        </span>
      </div>

      {/* PAGE 1: COVER PAGE SIMULATOR */}
      <div className="bg-white border border-slate-300 shadow-lg mx-auto w-full max-w-[620px] aspect-[1/1.414] p-8 flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Borders */}
        <div className="absolute inset-2 border-2 border-[#1a2a6c]"></div>
        <div className="absolute inset-3 border border-[#c9a84c]"></div>
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={Branding.logo} alt="Watermark" className="w-[400px] h-auto object-contain" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between py-4">
          {/* Institutional Heading */}
          <div className="text-center">
            <h1 className="text-base md:text-lg font-bold text-[#1a2a6c] tracking-tight uppercase">
              Delta State Polytechnic Ogwashi-Uku
            </h1>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">
              School of Engineering
            </h2>
            <p className="text-[10px] font-semibold text-[#c9a84c] tracking-widest uppercase mt-0.5">
              HND Projects Committee
            </p>

            <div className="bg-[#1a2a6c] text-white py-3 px-4 mt-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-bold tracking-wider uppercase text-center">
                Document Extraction & Normalization Certificate
              </h3>
            </div>
          </div>

          {/* Crest */}
          <div className="flex justify-center my-6">
            <div className="w-20 h-20 bg-white p-1 rounded-full border border-slate-100 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#1a2a6c" strokeWidth="3" />
                <circle cx="50" cy="50" r="41" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
                <path d="M 50 18 C 58 18, 68 25, 68 40 C 68 62, 50 78, 50 82 C 50 78, 32 62, 32 40 C 32 25, 42 18, 50 18 Z" fill="#1a2a6c" />
                <path d="M 46 60 Q 50 45, 54 60 Z" fill="#c9a84c" />
                <path d="M 50 48 Q 50 35, 47 38 Q 53 30, 53 38 Z" fill="#ef4444" />
                <path d="M 37 54 C 42 50, 48 52, 50 54 C 52 52, 58 50, 63 54 L 63 44 C 58 41, 52 43, 50 44 C 48 43, 42 41, 37 44 Z" fill="#ffffff" />
              </svg>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg p-5 text-left text-xs space-y-2.5 mx-4 relative z-10">
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Title of Work:</span>
              <span className="font-semibold text-slate-800 text-sm leading-tight block">
                {committee.projectMetadata?.projectTitle || 'Untitled HND Engineering Project'}
              </span>
            </div>
            
            <div className="pt-1">
              <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider mb-1">Project Students:</span>
              <div className="space-y-1">
                {committee.projectMetadata?.students?.map((student, idx) => (
                  <div key={student.id || idx} className="grid grid-cols-2 gap-4 bg-slate-50 p-1.5 rounded">
                    <span className="font-semibold text-slate-800 truncate">{student.fullName || 'Not Specified'}</span>
                    <span className="font-semibold text-slate-800 font-mono text-[10px] truncate">{student.matricNumber || 'Not Specified'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Supervisor:</span>
                <span className="font-semibold text-slate-800">{committee.projectMetadata?.supervisor?.name || 'Not Specified'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Date Extracted:</span>
                <span className="font-semibold text-slate-800">
                  {result?.processedAt ? new Date(result.processedAt).toLocaleDateString('en-NG') : new Date().toLocaleDateString('en-NG')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Department:</span>
                <span className="font-semibold text-slate-800">{committee.projectMetadata?.department || 'School of Engineering'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Academic Session:</span>
                <span className="font-semibold text-slate-800">{committee.projectMetadata?.academicSession || '2023/2024'}</span>
              </div>
            </div>
          </div>

          {/* Footer Page 1 */}
          <div className="text-center mt-6">
            <p className="text-[10px] text-slate-400 font-medium">
              Prepared by: DSPG Document Normalizer v1.0
            </p>
            <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">
              Page 1 of 2
            </p>
          </div>
        </div>
      </div>

      {/* PAGE 2: EXTRACTION DETAILS SIMULATOR */}
      <div className="bg-white border border-slate-300 shadow-lg mx-auto w-full max-w-[620px] aspect-[1/1.414] p-8 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute inset-2 border-2 border-[#1a2a6c]"></div>
        <div className="absolute inset-3 border border-[#c9a84c]"></div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={Branding.logo} alt="Watermark" className="w-[400px] h-auto object-contain" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between py-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#1a2a6c]">DELTA STATE POLYTECHNIC</p>
              <p className="text-[8px] text-slate-400">School of Engineering</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider">EXTRACTION DETAILS</p>
          </div>

          {/* Main Body */}
          <div className="flex-1 py-4 space-y-5 text-left">
            {/* Stats */}
            <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 text-[11px] space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] mb-1.5 border-b border-slate-200 pb-1">EXTRACTION STATS</h4>
              <div className="flex justify-between"><span className="text-slate-500">Document Name:</span> <span className="font-semibold text-slate-800 truncate max-w-[200px]">{analysis.fileName || 'Direct Text Area'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Word Count:</span> <span className="font-semibold text-slate-800">{result?.wordCount || 0} words</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Sentences:</span> <span className="font-semibold text-slate-800">{result?.sentenceCount || 0} sentences</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Paragraphs:</span> <span className="font-semibold text-slate-800">{result?.paragraphCount || 0} paragraphs</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Analysis Duration:</span> <span className="font-semibold text-slate-800">{result?.analysisDuration || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Session Defense:</span> <span className="font-semibold text-slate-800">{committee.projectMetadata?.academicSession || new Date().getFullYear()} / HND Defense</span></div>
            </div>


            {/* Circle dial mockup */}
            <div className="flex justify-center py-2">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                <span className="text-[8px] font-bold text-slate-400 uppercase">Verified</span>
              </div>
            </div>

            {/* Status Alert block */}
            <div className="border p-3 rounded-lg text-center font-bold text-xs bg-emerald-50 border-emerald-200 text-emerald-800">
              STATUS: DOCUMENT HASH SECURED
            </div>
          </div>

          <div className="text-center mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400 flex justify-between">
            <span>School of Engineering - Delta State Polytechnic Ogwashi-Uku</span>
            <span>Page 2 of 4</span>
          </div>
        </div>
      </div>

    </div>
  );
};
