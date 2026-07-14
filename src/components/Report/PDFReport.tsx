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
  const result = analysis.result;

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
                Plagiarism Check Report
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
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-left text-xs space-y-2.5 mx-4">
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Title of Work:</span>
              <span className="font-semibold text-slate-800 text-sm leading-tight block">
                {committee.projectTitle || 'Untitled HND Engineering Project'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Student Name:</span>
                <span className="font-semibold text-slate-800">{committee.studentName || 'Not Specified'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Reg Number:</span>
                <span className="font-semibold text-slate-800">{committee.regNumber || 'Not Specified'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Supervisor:</span>
                <span className="font-semibold text-slate-800">{committee.supervisorName || 'Not Specified'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase block text-[9px] tracking-wider">Date Checked:</span>
                <span className="font-semibold text-slate-800">
                  {result?.analysisDate || new Date().toLocaleDateString('en-NG')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Page 1 */}
          <div className="text-center mt-6">
            <p className="text-[10px] text-slate-400 font-medium">
              Prepared by: Plagiarism Checker System v1.0
            </p>
            <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">
              Page 1 of 4
            </p>
          </div>
        </div>
      </div>

      {/* PAGE 2: REPORT DETAILS SIMULATOR */}
      <div className="bg-white border border-slate-300 shadow-lg mx-auto w-full max-w-[620px] aspect-[1/1.414] p-8 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute inset-2 border-2 border-[#1a2a6c]"></div>
        <div className="absolute inset-3 border border-[#c9a84c]"></div>

        <div className="relative z-10 flex flex-col h-full justify-between py-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#1a2a6c]">DELTA STATE POLYTECHNIC</p>
              <p className="text-[8px] text-slate-400">School of Engineering</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider">REPORT DETAILS</p>
          </div>

          {/* Main Body */}
          <div className="flex-1 py-4 space-y-5 text-left">
            {/* Stats */}
            <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 text-[11px] space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] mb-1.5 border-b border-slate-200 pb-1">ANALYSIS RUN STATS</h4>
              <div className="flex justify-between"><span className="text-slate-500">Document Name:</span> <span className="font-semibold text-slate-800 truncate max-w-[200px]">{analysis.fileName || 'Direct Text Area'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Word Count:</span> <span className="font-semibold text-slate-800">{result?.wordCount || 0} words</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Analysis Duration:</span> <span className="font-semibold text-slate-800">{result?.analysisDuration || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Session Defense:</span> <span className="font-semibold text-slate-800">{new Date().getFullYear()} / HND Defense</span></div>
            </div>

            {/* Originality Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#1a2a6c]">
                <span>ORIGINALITY INDEX</span>
                <span>{result?.originalityScore || 0}%</span>
              </div>
              <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    (result?.originalityScore || 0) >= 80 ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                  style={{ width: `${result?.originalityScore || 0}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-400 italic">
                *(HND guidelines require a minimum of 80% originality for approval)
              </p>
            </div>

            {/* AI Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#1a2a6c]">
                <span>AI WRITTEN ESTIMATION</span>
                <span>{result?.aiProbability || 0}%</span>
              </div>
              <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    (result?.aiProbability || 0) <= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${result?.aiProbability || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Circle dial mockup */}
            <div className="flex justify-center py-2">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-bold text-slate-800">{result?.originalityScore || 0}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Original</span>
              </div>
            </div>

            {/* Status Alert block */}
            <div className={clsx(
              'border p-3 rounded-lg text-center font-bold text-xs',
              (result?.originalityScore || 0) >= 80 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            )}>
              {(result?.originalityScore || 0) >= 80 
                ? 'STATUS: APPROVED & PLAGIARISM COMPLIANT' 
                : 'STATUS: CORRECTIONS & REVIEW REQUIRED'
              }
            </div>
          </div>

          <div className="text-center mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400 flex justify-between">
            <span>School of Engineering - Delta State Polytechnic Ogwashi-Uku</span>
            <span>Page 2 of 4</span>
          </div>
        </div>
      </div>

      {/* PAGE 3: DETAILED ANALYSIS SIMULATOR */}
      <div className="bg-white border border-slate-300 shadow-lg mx-auto w-full max-w-[620px] aspect-[1/1.414] p-8 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute inset-2 border-2 border-[#1a2a6c]"></div>
        <div className="absolute inset-3 border border-[#c9a84c]"></div>

        <div className="relative z-10 flex flex-col h-full justify-between py-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#1a2a6c]">DELTA STATE POLYTECHNIC</p>
              <p className="text-[8px] text-slate-400">School of Engineering</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider">DETAILED ANALYSIS</p>
          </div>

          {/* Main Table Body */}
          <div className="flex-1 py-4 text-left space-y-4">
            <h4 className="font-bold text-[10px] text-[#1a2a6c] uppercase">SOURCE SIMILARITY SENTENCE INDEX</h4>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden text-[9px]">
              <div className="grid grid-cols-12 bg-[#1a2a6c] text-white font-bold p-1.5 uppercase tracking-wider">
                <div className="col-span-1 text-center">S/N</div>
                <div className="col-span-6">Flagged Section Snippet</div>
                <div className="col-span-3">Source Match</div>
                <div className="col-span-2 text-center">Sim %</div>
              </div>
              <div className="divide-y divide-slate-100">
                {result?.sources && result.sources.length > 0 ? (
                  result.sources.map((src, i) => (
                    <div key={i} className="grid grid-cols-12 p-2 items-center bg-slate-50/30">
                      <div className="col-span-1 text-center font-bold text-slate-600">{i + 1}</div>
                      <div className="col-span-6 text-slate-700 italic font-mono text-[8px] line-clamp-2">
                        "{src.text}"
                      </div>
                      <div className="col-span-3 text-slate-500 truncate pr-1">{src.source}</div>
                      <div className="col-span-2 text-center font-bold text-amber-700">{src.similarity}%</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 italic">No similar segments flagged. Excellent originality.</div>
                )}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-[10px] text-[#1a2a6c] uppercase">EXECUTIVE AUDIT SUMMARY</h4>
              <div className="bg-slate-50 p-3 rounded border-l-2 border-[#1a2a6c] text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
                {result?.summary}
              </div>
            </div>
          </div>

          <div className="text-center mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400 flex justify-between">
            <span>School of Engineering - Delta State Polytechnic Ogwashi-Uku</span>
            <span>Page 3 of 4</span>
          </div>
        </div>
      </div>

      {/* PAGE 4: COMMITTEE APPROVAL SIMULATOR */}
      <div className="bg-white border border-slate-300 shadow-lg mx-auto w-full max-w-[620px] aspect-[1/1.414] p-8 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="absolute inset-2 border-2 border-[#1a2a6c]"></div>
        <div className="absolute inset-3 border border-[#c9a84c]"></div>

        <div className="relative z-10 flex flex-col h-full justify-between py-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#1a2a6c]">DELTA STATE POLYTECHNIC</p>
              <p className="text-[8px] text-slate-400">School of Engineering</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider">COMMITTEE APPROVAL</p>
          </div>

          {/* Main Body */}
          <div className="flex-1 py-4 text-left space-y-4">
            <h4 className="font-bold text-[10px] text-[#1a2a6c] uppercase">HND PROJECTS COMMITTEE ENDORSEMENT STATEMENT</h4>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              This plagiarism audit report is compiled directly from the secure cloud-backed analysis system of the School of Engineering, Delta State Polytechnic Ogwashi-Uku. The signing members of the HND Projects Committee hereby confirm they have reviewed these findings and approved the project for final defense.
            </p>

            {/* Signatures block mockup */}
            <div className="grid grid-cols-2 gap-4">
              {/* Chairman Sign Block */}
              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 flex flex-col justify-between h-[100px]">
                <span className="font-bold text-[8px] text-[#1a2a6c] uppercase block">Chairman's Endorsement</span>
                <div className="h-10 flex items-center justify-center bg-white rounded border border-slate-100 overflow-hidden relative">
                  {committee.chairmanSignature ? (
                    <img src={committee.chairmanSignature} alt="Chairman Sign" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-slate-400 italic">Signature Pending</span>
                  )}
                  {chairmanValidated && (
                    <span className="absolute top-0.5 right-0.5 p-0.5 bg-green-100 rounded-full text-green-700">
                      <CheckCircle2 className="h-2 w-2" />
                    </span>
                  )}
                </div>
                <div className="text-[7.5px] text-slate-500">
                  <span className="font-bold text-slate-700 block">{committee.chairmanName || 'Pending Name'}</span>
                  Date: {committee.approvalDate}
                </div>
              </div>

              {/* Secretary Sign Block */}
              <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50 flex flex-col justify-between h-[100px]">
                <span className="font-bold text-[8px] text-[#1a2a6c] uppercase block">Secretary's Endorsement</span>
                <div className="h-10 flex items-center justify-center bg-white rounded border border-slate-100 overflow-hidden relative">
                  {committee.secretarySignature ? (
                    <img src={committee.secretarySignature} alt="Secretary Sign" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-slate-400 italic">Signature Pending</span>
                  )}
                  {secretaryValidated && (
                    <span className="absolute top-0.5 right-0.5 p-0.5 bg-green-100 rounded-full text-green-700">
                      <CheckCircle2 className="h-2 w-2" />
                    </span>
                  )}
                </div>
                <div className="text-[7.5px] text-slate-500">
                  <span className="font-bold text-slate-700 block">{committee.secretaryName || 'Pending Name'}</span>
                  Date: {committee.approvalDate}
                </div>
              </div>
            </div>

            {/* Stamp mock */}
            <div className="border border-slate-200 p-2.5 rounded bg-white flex items-center justify-between">
              <p className="text-[8.5px] text-slate-500 max-w-[150px]">
                This audit certificate is issued digitally by authority of the School of Engineering.
              </p>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#1a2a6c] flex flex-col items-center justify-center text-[#1a2a6c] text-[5px] font-bold bg-slate-50 shrink-0">
                <span>DSPG</span>
                <span className="text-[4px] text-[#c9a84c]">OFFICIAL STAMP</span>
                <span>ENG COMMITTEE</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-3 border-t border-slate-100 pt-2 text-[8px] text-slate-400 flex justify-between">
            <span>School of Engineering - Delta State Polytechnic Ogwashi-Uku</span>
            <span>Page 4 of 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
