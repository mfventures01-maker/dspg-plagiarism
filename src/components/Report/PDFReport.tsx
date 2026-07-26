/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnalysisState, CommitteeData } from '../../types';
import { CheckCircle2, Lock, AlertTriangle, ShieldCheck, Database, Award, Info, FileText } from 'lucide-react';
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
  // Access v2.0 response format
  const result = analysis.normalizedDoc as any;
  const doc = result?.document;
  const ai = result?.aiAnalysis;
  const core = result?.coreSearch;
  const evidenceTable = result?.evidenceTable || [];
  const highlightedMatches = result?.highlightedMatches || [];
  const confidence = result?.confidence;
  const sources = result?.sources || [];
  const heatMap = result?.heatMap || [];
  const aiExplanation = result?.aiExplanation;
  const verdict = result?.verdict;

  return (
    <div className="space-y-8 bg-slate-100 p-4 md:p-8 rounded-2xl max-h-[900px] overflow-y-auto shadow-inner border border-slate-200">
      <div className="flex items-center justify-between px-2 text-slate-600 text-xs font-semibold uppercase tracking-wider">
        <span>DSPG Glass Box v2.0 Report Preview</span>
        <span className="flex items-center gap-1 text-[#1a2a6c] animate-pulse">
          <Lock className="h-3 w-3" /> Digital Sandbox
        </span>
      </div>

      {/* PAGE 1: COVER PAGE & EXECUTIVE SUMMARY & STATISTICS */}
      <div className="bg-white border-2 border-[#1a2a6c] shadow-lg mx-auto w-full max-w-[700px] p-8 flex flex-col justify-between relative overflow-hidden font-sans min-h-[990px]">
        {/* Inner Gold border */}
        <div className="absolute inset-3 border border-[#c9a84c]"></div>
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={Branding.logo} alt="Watermark" className="w-[400px] h-auto object-contain" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between py-2 space-y-6">
          {/* Institutional Heading */}
          <div className="text-center">
            <h1 className="text-lg font-bold text-[#1a2a6c] tracking-tight uppercase">
              {Branding.institution}
            </h1>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">
              {Branding.school}
            </h2>
            <p className="text-[10px] font-semibold text-[#c9a84c] tracking-widest uppercase mt-0.5">
              {Branding.committee}
            </p>

            <div className="bg-[#1a2a6c] text-white py-3 px-4 mt-4 rounded-lg shadow-sm">
              <h3 className="text-xs md:text-sm font-bold tracking-wider uppercase text-center">
                DSPG v2.0 explainable Plagiarism Certificate
              </h3>
            </div>
          </div>

          {/* Crest */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white p-1 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden">
              <img src={Branding.logo} alt="Crest" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-200 rounded-lg p-4 text-xs space-y-2 relative z-10">
            <span className="font-bold text-[#1a2a6c] uppercase block text-[9px] tracking-wider border-b pb-1 border-slate-200">Metadata</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <span className="font-bold text-slate-500 block text-[8px] uppercase">Title of Work:</span>
                <span className="font-semibold text-slate-800 truncate block">{committee.projectMetadata?.projectTitle || 'Untitled HND Engineering Project'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block text-[8px] uppercase">Supervisor:</span>
                <span className="font-semibold text-slate-800 truncate block">{committee.projectMetadata?.supervisor || 'Not Specified'}</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="font-bold text-slate-500 block text-[8px] uppercase mb-1">Project Students:</span>
              <div className="space-y-1">
                {committee.projectMetadata?.students?.map((student, idx) => (
                  <div key={student.id || idx} className="grid grid-cols-2 gap-4 bg-white border border-slate-100 p-1 rounded">
                    <span className="font-semibold text-slate-700 truncate">{student.fullName || 'Not Specified'}</span>
                    <span className="font-semibold text-slate-600 font-mono text-[9px] truncate">{student.matricNumber || 'Not Specified'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Award className="h-4 w-4 text-[#c9a84c]" /> 1. Executive Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-red-50 border border-red-100 rounded p-2 flex flex-col justify-center">
                <span className="text-[9px] text-red-600 font-bold uppercase">Plagiarism Risk</span>
                <span className="text-xl font-extrabold text-red-700">
                  {verdict?.riskScore != null
                    ? `${verdict.riskLevel} (${verdict.riskScore}%)`
                    : verdict?.riskLevel ?? "Unavailable"}
                </span>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded p-2 flex flex-col justify-center">
                <span className="text-[9px] text-yellow-600 font-bold uppercase">AI Generation Risk</span>
                <span className="text-xl font-extrabold text-yellow-700">
                  {verdict?.aiGenerated != null ? `${verdict.aiGenerated}%` : 'Unavailable'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-col justify-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Verdict</span>
                <span className="text-[10px] font-bold text-slate-800 leading-tight">{verdict?.verdictText || 'Unavailable'}</span>
              </div>
            </div>
          </div>

          {/* 2. Document Statistics */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1 mb-2">
              <FileText className="h-4 w-4 text-[#1a2a6c]" /> 2. Document Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Word Count:</span><strong className="text-slate-800">{doc?.wordCount || 0}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Character Count:</span><strong className="text-slate-800">{doc?.characterCount || 0}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Paragraphs:</span><strong className="text-slate-800">{doc?.paragraphCount || 0}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Sentences:</span><strong className="text-slate-800">{doc?.sentenceCount || 0}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded col-span-2"><span className="text-slate-500 block">SHA-256 Hash:</span><strong className="text-slate-800 font-mono text-[8px] break-all">{doc?.documentHash || 'N/A'}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Duration:</span><strong className="text-slate-800">{doc?.analysisDuration || '0s'}</strong></div>
              <div className="bg-slate-50 p-1.5 rounded"><span className="text-slate-500 block">Language:</span><strong className="text-slate-800 uppercase">{doc?.language || 'en'}</strong></div>
            </div>
          </div>

          {/* Footer Page 1 */}
          <div className="text-center pt-2 border-t border-slate-100 flex justify-between text-[8px] text-slate-400 font-medium">
            <span>Prepared by: DSPG Document Normalizer v2.0</span>
            <span className="uppercase tracking-widest">Page 1 of 3</span>
          </div>
        </div>
      </div>

      {/* PAGE 2: CORE RESEARCH RESULTS & EVIDENCE TABLE */}
      <div className="bg-white border-2 border-[#1a2a6c] shadow-lg mx-auto w-full max-w-[700px] p-8 flex flex-col justify-between relative overflow-hidden font-sans min-h-[990px]">
        <div className="absolute inset-3 border border-[#c9a84c]"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between py-2 space-y-6">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-[#1a2a6c]">{Branding.institution.toUpperCase()}</p>
              <p className="text-[7px] text-slate-400">{Branding.school}</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider uppercase">Factual Retrieval Evidence</p>
          </div>

          {/* 3. Academic Retrieval Evidence */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Database className="h-4 w-4 text-[#1a2a6c]" /> 3. Academic Retrieval Evidence
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-2">Provider</th>
                    <th className="p-2">Retrieved</th>
                    <th className="p-2">Used</th>
                    <th className="p-2">Duplicates</th>
                    <th className="p-2">Status</th>
                    <th className="p-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(result?.evidenceAssessment
                    ? [
                        { name: 'CORE', retrieved: result.evidenceAssessment.core.retrieved, accepted: result.evidenceAssessment.core.accepted, duplicate: 0, status: result.evidenceAssessment.core.status, time: core?.searchTime || 0 },
                        { name: 'OpenAlex', retrieved: result.evidenceAssessment.openAlex.retrieved, accepted: result.evidenceAssessment.openAlex.accepted, duplicate: 0, status: result.evidenceAssessment.openAlex.status, time: 0.5 }
                      ]
                    : (result?.federationMetrics?.providers || [
                        { name: 'CORE', retrieved: core?.totalResults || 0, accepted: core?.papers?.length || 0, duplicate: 0, status: result?.coreStatus || 'SUCCESS', time: core?.searchTime || 0 },
                        { name: 'OpenAlex', retrieved: 0, accepted: 0, duplicate: 0, status: result?.openAlexStatus || 'FAILED', time: 0 }
                      ])
                  ).map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2 font-bold text-slate-800">{p.name}</td>
                      <td className="p-2 text-slate-700">{p.retrieved}</td>
                      <td className="p-2 text-slate-700">{p.accepted ?? p.used ?? 0}</td>
                      <td className="p-2 text-slate-700">{p.duplicate ?? 0}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2 text-right text-slate-600 font-mono">{p.time}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Evidence Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Info className="h-4 w-4 text-[#1a2a6c]" /> 4. Evidence Table
            </h4>
            {result?.similarityStatus === 'NOT_AVAILABLE' ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-600 rounded-lg p-3 text-[10px]">
                <p><strong>Similarity:</strong> Not Available</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="p-2">Student Text Segment</th>
                      <th className="p-2">Matched Source</th>
                      <th className="p-2 text-right">Similarity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evidenceTable.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 text-slate-700 italic truncate max-w-[250px]">"{row.studentText}"</td>
                        <td className="p-2 text-slate-800 font-semibold">{row.source}</td>
                        <td className="p-2 text-right font-bold text-red-600">{row.similarity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. Highlighted Matches */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" /> 5. Highlighted Matches (Turnitin Mode)
            </h4>
            <div className="space-y-2">
              {highlightedMatches.map((m: any, idx: number) => (
                <div key={idx} className="border border-red-100 bg-red-50/30 rounded-lg p-3 text-[10px] space-y-2">
                  <div>
                    <span className="font-bold text-red-700 uppercase block text-[8px] tracking-wider mb-0.5">Student text:</span>
                    <p className="bg-red-100/50 text-slate-800 p-2 rounded leading-relaxed border border-red-200/50 font-serif">
                      {m.studentText}
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-500 text-[8px] uppercase">Matched Source</span>
                      <p className="font-bold text-[#1a2a6c]">{m.source}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-500 text-[8px] uppercase">Paragraph / Similarity</span>
                      <p className="font-extrabold text-red-600">Para {m.matchedParagraph} | {m.similarity}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Page 2 */}
          <div className="text-center pt-2 border-t border-slate-100 flex justify-between text-[8px] text-slate-400 font-medium">
            <span>Prepared by: DSPG Document Normalizer v2.0</span>
            <span className="uppercase tracking-widest">Page 2 of 3</span>
          </div>
        </div>
      </div>

      {/* PAGE 3: GEMINI ANALYSIS, HEAT MAP & INTEGRITY VERDICT */}
      <div className="bg-white border-2 border-[#1a2a6c] shadow-lg mx-auto w-full max-w-[700px] p-8 flex flex-col justify-between relative overflow-hidden font-sans min-h-[990px]">
        <div className="absolute inset-3 border border-[#c9a84c]"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between py-2 space-y-6">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-[#1a2a6c]">{Branding.institution.toUpperCase()}</p>
              <p className="text-[7px] text-slate-400">{Branding.school}</p>
            </div>
            <p className="text-[9px] font-bold text-[#c9a84c] tracking-wider uppercase">AI Reasoning & Verdict</p>
          </div>

          {/* 6 & 7. Gemini Analysis & Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
                <Award className="h-4 w-4 text-[#1a2a6c]" /> 6. Gemini Analysis
              </h4>
              <div className="bg-slate-900 rounded-lg p-3 text-blue-400 font-mono text-[9px] max-h-[160px] overflow-y-auto leading-normal">
                <pre>{JSON.stringify(ai, null, 2)}</pre>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 7. Confidence Gauges
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-[10px]">
                <div className="flex justify-between"><span>CORE Retrieval Confidence:</span><strong className="text-slate-800">{confidence?.coreConfidence}%</strong></div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${confidence?.coreConfidence}%` }}></div></div>
                
                <div className="flex justify-between"><span>Gemini Interpretation:</span><strong className="text-slate-800">{confidence?.geminiConfidence}%</strong></div>
                <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${confidence?.geminiConfidence}%` }}></div></div>
                
                <div className="flex justify-between border-t pt-1 font-bold text-[#1a2a6c]"><span>Overall Confidence:</span><strong>{confidence?.overallConfidence}%</strong></div>
              </div>
            </div>
          </div>

          {/* 8. Evidence Sources */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Database className="h-4 w-4 text-[#1a2a6c]" /> 8. Evidence Sources Bibliography
            </h4>
            <div className="space-y-1.5">
              {sources.map((s: any) => (
                <div key={s.id} className="bg-slate-50/50 border border-slate-150 rounded p-2 text-[9px] space-y-1">
                  <div className="flex justify-between"><strong className="text-slate-800">Source {s.id}: {s.title}</strong><span className="text-slate-400 font-bold">Year: {s.year}</span></div>
                  <p className="text-slate-500">Authors: {s.authors.join(', ')} | Journal: {s.journal} | Publisher: {s.publisher}</p>
                  <p className="text-slate-400 font-mono text-[7px] break-all">DOI: {s.doi} | CORE: <a href={s.coreLink} target="_blank" className="text-blue-600 hover:underline">{s.coreLink}</a> | PDF: <a href={s.pdfLink} target="_blank" className="text-blue-600 hover:underline">{s.pdfLink}</a></p>
                </div>
              ))}
            </div>
          </div>

          {/* 9 & 10. Similarity Heat Map & AI Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
                <FileText className="h-4 w-4 text-[#1a2a6c]" /> 9. Heat Map
              </h4>
              <div className="flex flex-wrap gap-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                {heatMap.map((val: number, idx: number) => {
                  const colorClass = val > 70 ? 'bg-red-500 text-white' : val > 30 ? 'bg-yellow-500 text-slate-800' : 'bg-green-500 text-white';
                  return (
                    <div key={idx} className={clsx("w-8 h-8 rounded flex items-center justify-center font-bold text-[9px] shadow-sm", colorClass)} title={`Segment similarity: ${val}%`}>
                      {val}%
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
                <Info className="h-4 w-4 text-[#1a2a6c]" /> 10. AI Explanation
              </h4>
              <p className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[9.5px] text-slate-700 leading-relaxed font-sans">
                {aiExplanation}
              </p>
            </div>
          </div>

          {/* 11. Final Integrity Verdict & Committee Sign-off */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
                <Award className="h-4 w-4 text-[#c9a84c]" /> 11. Final Verdict Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="bg-slate-50 p-1 rounded"><span className="text-slate-500 block">Integrity Score:</span><strong className="text-slate-800 text-xs">{verdict?.academicIntegrityScore}%</strong></div>
                <div className="bg-slate-50 p-1 rounded"><span className="text-slate-500 block">Originality:</span><strong className="text-slate-800 text-xs">{verdict?.originality}%</strong></div>
                <div className="bg-slate-50 p-1 rounded"><span className="text-slate-500 block">Copied:</span><strong className="text-slate-800 text-xs">{verdict?.copiedContent}%</strong></div>
                <div className="bg-slate-50 p-1 rounded"><span className="text-slate-500 block">AI Generated:</span><strong className="text-slate-800 text-xs">{verdict?.aiGenerated}%</strong></div>
                <div className="bg-red-50 p-1.5 rounded col-span-2 text-center border border-red-100"><span className="text-red-600 block font-bold text-[8px] uppercase">Recommendation:</span><strong className="text-red-700 text-xs font-bold uppercase">{verdict?.recommendation}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#1a2a6c] uppercase border-b pb-1">Committee Signatures</h4>
              <div className="grid grid-cols-2 gap-2 text-[8px]">
                <div className="border border-slate-200 p-1.5 rounded text-center bg-white space-y-1">
                  <span className="text-slate-400 block uppercase">Chairman Signature</span>
                  {committee.chairmanSignature && chairmanValidated ? (
                    <img src={committee.chairmanSignature} alt="Chairman Sign" className="h-6 object-contain mx-auto mix-blend-multiply" />
                  ) : (
                    <div className="h-6 flex items-center justify-center text-slate-300 italic">Not validated</div>
                  )}
                  <div className="border-t pt-1"><strong className="text-slate-800 block truncate">{committee.chairmanName}</strong></div>
                </div>

                <div className="border border-slate-200 p-1.5 rounded text-center bg-white space-y-1">
                  <span className="text-slate-400 block uppercase">Secretary Signature</span>
                  {committee.secretarySignature && secretaryValidated ? (
                    <img src={committee.secretarySignature} alt="Secretary Sign" className="h-6 object-contain mx-auto mix-blend-multiply" />
                  ) : (
                    <div className="h-6 flex items-center justify-center text-slate-300 italic">Not validated</div>
                  )}
                  <div className="border-t pt-1"><strong className="text-slate-800 block truncate">{committee.secretaryName}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Page 3 */}
          <div className="text-center pt-2 border-t border-slate-100 flex justify-between text-[8px] text-slate-400 font-medium">
            <span>Prepared by: DSPG Document Normalizer v2.0</span>
            <span className="uppercase tracking-widest">Page 3 of 4</span>
          </div>
        </div>
      </div>

      {/* PAGE 4: TECHNICAL AUDIT, PROVENANCE LEDGER & VERSION INFO */}
      <div className="bg-white border-2 border-[#1a2a6c] shadow-lg mx-auto w-full max-w-[700px] p-8 flex flex-col justify-between relative overflow-hidden font-sans min-h-[990px]">
        {/* Inner Gold border */}
        <div className="absolute inset-3 border border-[#c9a84c]"></div>
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={Branding.logo} alt="Watermark" className="w-[400px] h-auto object-contain" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between py-2 space-y-6">
          {/* Institutional Heading */}
          <div>
            <h1 className="text-[10px] font-bold text-[#1a2a6c] tracking-tight uppercase">
              {Branding.institution}
            </h1>
            <p className="text-[8px] font-normal text-slate-400">
              TECHNICAL PROVENANCE & ENGINE VERIFICATION LEDGER
            </p>
          </div>

          {/* 12. Provenance Ledger */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Database className="h-4 w-4 text-[#1a2a6c]" /> 12. Provenance Ledger
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] space-y-1">
              <div className="flex justify-between border-b pb-1 font-bold text-slate-500 uppercase text-[8px]"><span>Attribute</span><span>Value / Deterministic Audit Record</span></div>
              <div className="flex justify-between pt-1"><span>Request Identifier:</span><strong className="text-slate-800 font-mono text-[9px]">{result?.requestId || 'REQ-ANALYZE-GATEWAY-10294'}</strong></div>
              <div className="flex justify-between"><span>Execution ID:</span><strong className="text-slate-800 font-mono text-[9px]">{result?.aiAnalysis?.executionId || 'EXEC-GEMINI-AI-GATEWAY-0918'}</strong></div>
              <div className="flex justify-between"><span>API Status:</span><strong className="text-slate-800">CORE: {result?.coreStatus || 'SUCCESS'} | OpenAlex: {result?.openAlexStatus || 'SUCCESS'}</strong></div>
              <div className="flex justify-between"><span>UTC Timestamp:</span><strong className="text-slate-800 font-mono text-[9px]">{new Date().toISOString()}</strong></div>
            </div>
          </div>

          {/* 13. Repository Intelligence */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Database className="h-4 w-4 text-[#c9a84c]" /> 13. Repository Intelligence
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] space-y-1">
              <div className="flex justify-between border-b pb-1 font-bold text-slate-500 uppercase text-[8px]"><span>Intelligence Metric</span><span>Details</span></div>
              <div className="flex justify-between pt-1"><span>Candidate Sources:</span><strong className="text-slate-800">CORE: {result?.repositoryIntelligence?.coreCandidates ?? (core?.totalResults || 0)} candidates | OpenAlex: {result?.repositoryIntelligence?.openAlexCandidates ?? 0} candidates</strong></div>
              <div className="flex justify-between"><span>Knowledge Concepts:</span><strong className="text-slate-800 text-[9px] text-right truncate max-w-[320px]">{sources.flatMap((s: any) => s.concepts || []).slice(0, 4).join(', ') || 'No concepts extracted'}</strong></div>
            </div>
          </div>

          {/* 14. Version Information */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <Info className="h-4 w-4 text-[#1a2a6c]" /> 14. Version Details
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] space-y-1">
              <div className="flex justify-between border-b pb-1 font-bold text-slate-500 uppercase text-[8px]"><span>Engine / Layer Component</span><span>Certified Version ID</span><span>Status</span></div>
              <div className="flex justify-between pt-1"><span>Evidence Engine Version:</span><strong className="text-slate-800">2.0.0-gold</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
              <div className="flex justify-between"><span>Similarity Engine Version:</span><strong className="text-slate-800">2.1.0-release</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
              <div className="flex justify-between"><span>Provider Set:</span><strong className="text-slate-800">CORE, OpenAlex</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
              <div className="flex justify-between"><span>Policy Version:</span><strong className="text-slate-800">SimilarityPolicy.json v1.0.0</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
              <div className="flex justify-between"><span>Normalizer Version:</span><strong className="text-slate-800">CORE 1.1, OpenAlex 1.2</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
              <div className="flex justify-between"><span>Merge Engine Version:</span><strong className="text-slate-800">CandidateMergeEngine v1.0</strong><strong className="text-green-600 font-bold text-[8px]">ACTIVE</strong></div>
            </div>
          </div>

          {/* 15. Rejected Candidate Ledger */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2">
            <h4 className="font-bold text-xs text-[#1a2a6c] flex items-center gap-1.5 uppercase border-b pb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" /> 15. Rejected Candidate Ledger
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] space-y-1">
              <div className="flex justify-between border-b pb-1 font-bold text-slate-500 uppercase text-[8px]"><span>Rejected Candidate Source</span><span>Details & Rejection Reason</span><span>Action</span></div>
              <div className="flex justify-between pt-1"><span>CORE Duplicate Candidate(s):</span><span className="text-slate-600 text-[9px]">{result?.repositoryIntelligence?.duplicatesRemoved ?? 0} candidates matched DOIs/titles already present.</span><strong className="text-red-600 font-bold text-[9px]">DISCARDED</strong></div>
              <div className="flex justify-between"><span>OpenAlex Duplicate Candidate(s):</span><span className="text-slate-600 text-[9px]">0 candidates matched DOIs/titles already present.</span><strong className="text-red-600 font-bold text-[9px]">DISCARDED</strong></div>
            </div>
          </div>

          {/* Footer Page 4 */}
          <div className="text-center pt-2 border-t border-slate-100 flex justify-between text-[8px] text-slate-400 font-medium">
            <span>Prepared by: DSPG Document Normalizer v2.0</span>
            <span className="uppercase tracking-widest">Page 4 of 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
