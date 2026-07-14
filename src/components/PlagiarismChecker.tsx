/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card } from './UIComponents/Card';
import { Button } from './UIComponents/Button';
import { SignatureBlock } from './UIComponents/SignatureBlock';
import { ProgressRing } from './UIComponents/ProgressRing';
import { FileUploadZone } from './UIComponents/FileUploadZone';
import { ReportHeader } from './Report/ReportHeader';
import { ReportFooter } from './Report/ReportFooter';
import { PDFReport } from './Report/PDFReport';
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck';
import { useFileUpload } from '../hooks/useFileUpload';
import { CommitteeData } from '../types';
import { 
  ShieldCheck, AlertTriangle, FileText, RefreshCw, 
  CheckCircle, BarChart, Zap, Download, Printer, 
  HelpCircle, User, BookOpen, UserCheck, Eye, Clipboard,
  Cpu, FileCheck, ArrowRight, Lock
} from 'lucide-react';
import { clsx } from 'clsx';

// Pre-loaded high-quality engineering HND project sample for immediate testing
const SAMPLE_PROJECT = {
  title: 'Design and Construction of a Microcontroller-Based Smart Irrigation System',
  student: 'Okonkwo Chukwudi Emmanuel',
  regNumber: 'DSPG/HND/ENG/2024/0482',
  supervisor: 'Engr. Brian Abugewa',
  text: `This project describes the design and implementation of an automated smart irrigation system utilizing an ATmega328P microcontroller integrated with capacitive soil moisture sensors and a water pump. Irrigation is one of the most vital agricultural practices in Nigeria, where drought and erratic rainfall patterns often threaten food security, especially in Delta State. Standard manual irrigation leads to massive water waste and inefficient labor resources. 

To resolve this challenge, the proposed system reads real-time moisture parameters from the soil and cross-references them against configured threshold limits. When the volumetric water content drops below 35%, the microcontroller triggers a 5V relay module which activates a submersible water pump. Once the soil reaches a saturated level of 75%, the controller deactivates the pump. This closed-loop automatic feedback loop ensures optimal moisture preservation and prevents root rot.

The system incorporates an LCD screen to display the volumetric moisture percentages and current pump status. System reliability was verified across multiple soil configurations, indicating a 40% reduction in water usage compared to conventional timed-watering techniques. Future recommendations involve the integration of a LoRa module for remote telemetry monitoring across expansive polytechnic farm settlements.`
};

export const PlagiarismChecker: React.FC = () => {
  const { state, runCheck, compilePDFReport, resetState } = usePlagiarismCheck();
  const { file, fileName, handleSelectFile, clearFile } = useFileUpload();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  
  // Form details
  const [studentName, setStudentName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [supervisorName, setSupervisorName] = useState('');

  // Committee endorsement states
  const [committee, setCommittee] = useState<CommitteeData>({
    studentName: '',
    regNumber: '',
    projectTitle: '',
    supervisorName: '',
    chairmanName: 'Engr. (Dr.) Benjamin Odoni',
    chairmanSignature: null,
    chairmanSignType: 'drawn',
    secretaryName: 'Engr. Brian Abugewa',
    secretarySignature: null,
    secretarySignType: 'drawn',
    approvalDate: new Date().toISOString().split('T')[0],
    stampImage: null
  });

  const [chairmanValidated, setChairmanValidated] = useState(false);
  const [secretaryValidated, setSecretaryValidated] = useState(false);
  const [isCompilingReport, setIsCompilingReport] = useState(false);

  // Sync state data into the committee model
  useEffect(() => {
    setCommittee(prev => ({
      ...prev,
      studentName,
      regNumber,
      projectTitle,
      supervisorName
    }));
  }, [studentName, regNumber, projectTitle, supervisorName]);

  // Load sample content for demo purposes
  const handleLoadSample = () => {
    setStudentName(SAMPLE_PROJECT.student);
    setRegNumber(SAMPLE_PROJECT.regNumber);
    setProjectTitle(SAMPLE_PROJECT.title);
    setSupervisorName(SAMPLE_PROJECT.supervisor);
    setTextInput(SAMPLE_PROJECT.text);
    setActiveTab('text');
  };

  const handleStartAnalysis = async () => {
    if (activeTab === 'text') {
      if (!textInput.trim() || textInput.length < 10) {
        alert('Please enter at least 10 characters to perform plagiarism detection.');
        return;
      }
      await runCheck(textInput, null);
    } else {
      if (!file) {
        alert('Please select or upload a document file (.txt, .docx, .pdf).');
        return;
      }
      await runCheck('', file);
    }
  };

  const handleCompilePDF = async () => {
    if (!chairmanValidated || !secretaryValidated) {
      alert('Chairman and Secretary signatures must be validated and timestamped first.');
      return;
    }
    setIsCompilingReport(true);
    try {
      await compilePDFReport(committee);
    } catch (e) {
      alert('Failed to compile PDF report. Please verify your inputs.');
    } finally {
      setIsCompilingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Decorative DSPG Blue top line banner */}
      <div className="h-2 bg-[#1a2a6c] w-full"></div>
      <div className="h-1 bg-[#c9a84c] w-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Banner with Polytechnic Brand */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 md:p-8 bg-gradient-to-r from-[#1a2a6c] via-[#2d4059] to-[#1a2a6c] text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 shrink-0 bg-white p-1 rounded-full shadow-md">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#1a2a6c" strokeWidth="4" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#c9a84c" strokeWidth="2" />
                  <path d="M 50 18 C 58 18, 68 25, 68 40 C 68 62, 50 78, 50 82 C 50 78, 32 62, 32 40 C 32 25, 42 18, 50 18 Z" fill="#1a2a6c" />
                  <path d="M 46 60 Q 50 45, 54 60 Z" fill="#c9a84c" />
                  <path d="M 50 48 Q 50 35, 47 38 Q 53 30, 53 38 Z" fill="#ef4444" />
                  <path d="M 37 54 C 42 50, 48 52, 50 54 C 52 52, 58 50, 63 54 L 63 44 C 58 41, 52 43, 50 44 C 48 43, 42 41, 37 44 Z" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  DELTA STATE POLYTECHNIC OGWASHI-UKU
                </h1>
                <p className="text-sm font-medium text-slate-200 uppercase tracking-wider">
                  School of Engineering &bull; HND Projects Committee
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3" /> Academic Integrity Compliant
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30">
                    HND Defense v1.0
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="gold"
              size="sm"
              icon={<Clipboard className="h-4 w-4" />}
              onClick={handleLoadSample}
              className="md:self-center"
            >
              Load Sample Project Abstract
            </Button>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Metadata & Scanning Input Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Student & Supervisor Metadata Card */}
            <Card
              title="Student & Project Metadata"
              subtitle="Please compile the fields below. This details will be printed on the official cover sheet of the plagiarism audit certificate."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" /> Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                    placeholder="e.g. Okonkwo Chukwudi Emmanuel"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                    placeholder="e.g. DSPG/HND/ENG/2024/0482"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Project / Thesis Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                    placeholder="e.g. Design and Construction of a Microcontroller-Based Smart Irrigation System"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Project Supervisor
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                    placeholder="e.g. Engr. Brian Abugewa"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* 2. Text Input Tabs & Document Dropzone Card */}
            <Card
              title="Academic Text Submission"
              subtitle="Paste your thesis body/abstract, or drag and drop your document file directly."
            >
              {/* Tabs Switcher */}
              <div className="flex border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveTab('text')}
                  className={clsx(
                    'flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-all duration-150 focus:outline-none',
                    activeTab === 'text'
                      ? 'border-[#1a2a6c] text-[#1a2a6c]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  )}
                >
                  Text Input Field
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={clsx(
                    'flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-all duration-150 focus:outline-none',
                    activeTab === 'file'
                      ? 'border-[#1a2a6c] text-[#1a2a6c]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  )}
                >
                  File Upload (.pdf, .docx, .txt)
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'text' ? (
                <div className="space-y-4">
                  <textarea
                    rows={10}
                    className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:border-[#1a2a6c] outline-none transition-all bg-slate-50 focus:bg-white resize-y font-sans leading-relaxed"
                    placeholder="Paste your abstract or project chapters here (minimum 10 characters)..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>
                      Estimated Words: <strong className="text-slate-700">{textInput.trim() ? textInput.trim().split(/\s+/).length : 0} words</strong>
                    </span>
                    <span>Max Size limit: 10MB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileUploadZone
                    selectedFileName={fileName}
                    onFileSelect={handleSelectFile}
                    onClear={clearFile}
                  />
                </div>
              )}

              {/* Scan Actions */}
              <div className="mt-6 flex justify-end gap-3">
                {state.status !== 'idle' && (
                  <Button
                    variant="outline"
                    onClick={resetState}
                  >
                    Reset Check
                  </Button>
                )}
                <Button
                  variant="primary"
                  loading={state.status === 'scanning'}
                  onClick={handleStartAnalysis}
                  icon={<Zap className="h-4 w-4" />}
                >
                  Analyze & Verify Integrity
                </Button>
              </div>
            </Card>

            {/* Scanning Feedback Panel */}
            {state.status === 'scanning' && (
              <Card className="border border-blue-200 bg-blue-50/20 animate-pulse">
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <RefreshCw className="h-10 w-10 text-[#1a2a6c] animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Auditing Academic Integrity Draft...
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md">
                    The School of Engineering server is currently reading the document, mapping text chunks, searching online index databases, and parsing AI pattern parameters. This may take up to 10 seconds.
                  </p>
                  
                  {/* Fake step markers for design rythm */}
                  <div className="grid grid-cols-3 gap-6 mt-6 w-full max-w-md text-xs text-slate-400 font-mono">
                    <div className="flex flex-col items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">✓</div>
                      <span>Extracting Text</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold mb-1">✓</div>
                      <span>Mapping Chunks</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-5 w-5 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center text-[10px] font-bold mb-1">
                        <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                      </div>
                      <span className="text-blue-600 font-semibold">Gemini Audit</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Error state */}
            {state.status === 'error' && (
              <Card className="border border-red-200 bg-red-50/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 rounded-lg text-red-600 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-800">Analysis Scanning Interrupted</h3>
                    <p className="text-sm text-red-700 mt-1">{state.error}</p>
                    <div className="mt-4">
                      <Button variant="danger" size="sm" onClick={handleStartAnalysis}>
                        Retry Check
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* 3. Plagiarism Analysis Results Panel */}
            {state.status === 'complete' && state.result && (
              <div className="space-y-6">
                
                {/* Visual Scores Bento Grid */}
                <Card title="Analysis Metrics Summary">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    
                    {/* Dial 1: Originality */}
                    <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center bg-slate-50/50">
                      <ProgressRing
                        percentage={state.result.originalityScore}
                        label="Originality"
                        type="originality"
                      />
                      <p className="text-xs font-medium text-slate-500 text-center mt-3">
                        Higher is better. DSPG Benchmark: <strong>80% minimum</strong>.
                      </p>
                    </div>

                    {/* Dial 2: AI Generated probability */}
                    <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center bg-slate-50/50">
                      <ProgressRing
                        percentage={state.result.aiProbability}
                        label="AI generated"
                        type="ai"
                      />
                      <p className="text-xs font-medium text-slate-500 text-center mt-3">
                        Lower is better. Probable writing statistical pattern.
                      </p>
                    </div>

                    {/* Status Alert Badge */}
                    <div className="p-5 rounded-xl border flex flex-col justify-center items-center h-full text-center bg-white border-slate-200">
                      {(state.result.originalityScore) >= 80 ? (
                        <>
                          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                            <CheckCircle className="h-7 w-7" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Draft Compliant</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Originality score of <strong>{state.result.originalityScore}%</strong> complies with the HND defense rules.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-amber-100 text-amber-600 rounded-full mb-3">
                            <AlertTriangle className="h-7 w-7" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 font-sans">Draft Non-Compliant</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Originality score of <strong>{state.result.originalityScore}%</strong> is below the required 80% threshold.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Detailed Flagged Sections Table */}
                <Card
                  title="Source Match Segment Map"
                  subtitle="Detailed breakdown of matched sentences, academic sources, and similarity factors."
                >
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-500 text-xs font-bold uppercase">
                          <th className="py-3 px-4">S/N</th>
                          <th className="py-3 px-4">Flagged Section</th>
                          <th className="py-3 px-4">Match Source</th>
                          <th className="py-3 px-4 text-center">Sim %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {state.result.sources && state.result.sources.length > 0 ? (
                          state.result.sources.map((source, index) => (
                            <tr key={index} className="hover:bg-slate-50/60 transition-all">
                              <td className="py-3 px-4 font-bold text-slate-700">{index + 1}</td>
                              <td className="py-3 px-4 text-slate-600 font-mono text-xs max-w-[240px] leading-relaxed">
                                "{source.text}"
                              </td>
                              <td className="py-3 px-4 text-slate-500 italic max-w-[150px] truncate">
                                {source.source}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={clsx(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold',
                                  source.similarity >= 50
                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                )}>
                                  {source.similarity}%
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 px-4 text-center text-slate-400 italic">
                              No matching plagiarized sources detected. High-quality human draft.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Executive Summary Card */}
                <Card
                  title="HND Committee Executive Summary"
                  subtitle="Detailed feedback from the AI audit mapping Nigerian Technical Education standards."
                >
                  <div className="border-l-4 border-[#1a2a6c] bg-slate-50 p-4 rounded-r-xl">
                    <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                      {state.result.summary}
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* RIGHT: Committee Endorsement & PDF Compiler */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Committee Sign-off Card */}
            <Card
              title="HND Projects Committee Endorsement"
              subtitle="The Project Supervisor, Committee Chairman, and Committee Secretary must provide their signatures to compile the final certified report."
            >
              {state.status !== 'complete' ? (
                <div className="text-center py-6 text-slate-500 flex flex-col items-center">
                  <HelpCircle className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm">Please start and complete your document scan first before signing.</p>
                  <div className="w-16 h-0.5 bg-slate-200 my-4"></div>
                  <p className="text-xs max-w-xs text-slate-400">
                    Once the document scan concludes successfully, signature fields will activate to let you certify the originality findings.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Info Indicator */}
                  <div className="p-3 bg-[#1a2a6c]/5 border border-[#1a2a6c]/10 text-slate-700 text-xs rounded-lg flex gap-2.5 leading-relaxed">
                    <Lock className="h-4 w-4 text-[#1a2a6c] shrink-0 mt-0.5" />
                    <span>
                      Scan successful. Please enter signatory names, draw or upload signatures, and tap <strong>Verify Signature</strong> to bind digital certificates.
                    </span>
                  </div>

                  {/* Chairman Sign block */}
                  <SignatureBlock
                    roleTitle="Chairman, School of Engineering HND Projects Committee"
                    signatoryName={committee.chairmanName}
                    onNameChange={(name) => setCommittee(prev => ({ ...prev, chairmanName: name }))}
                    signatureData={committee.chairmanSignature}
                    onSignatureChange={(sig, type) => {
                      setCommittee(prev => ({ ...prev, chairmanSignature: sig, chairmanSignType: type }));
                      if (!sig) setChairmanValidated(false);
                    }}
                    signType={committee.chairmanSignType}
                    dateValue={committee.approvalDate}
                    onDateChange={(d) => setCommittee(prev => ({ ...prev, approvalDate: d }))}
                    isValidated={chairmanValidated}
                    onValidate={() => setChairmanValidated(true)}
                  />

                  {/* Secretary Sign block */}
                  <SignatureBlock
                    roleTitle="Secretary, School of Engineering HND Projects Committee"
                    signatoryName={committee.secretaryName}
                    onNameChange={(name) => setCommittee(prev => ({ ...prev, secretaryName: name }))}
                    signatureData={committee.secretarySignature}
                    onSignatureChange={(sig, type) => {
                      setCommittee(prev => ({ ...prev, secretarySignature: sig, secretarySignType: type }));
                      if (!sig) setSecretaryValidated(false);
                    }}
                    signType={committee.secretarySignType}
                    dateValue={committee.approvalDate}
                    onDateChange={(d) => setCommittee(prev => ({ ...prev, approvalDate: d }))}
                    isValidated={secretaryValidated}
                    onValidate={() => setSecretaryValidated(true)}
                  />

                  {/* Certified stamp placeholder visualization */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-[#1a2a6c] flex items-center justify-center bg-white shrink-0">
                        <svg viewBox="0 0 100 100" className="w-10 h-10">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1a2a6c" strokeWidth="2" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#c9a84c" strokeWidth="1" />
                          <path d="M 50 25 C 50 25, 60 40, 50 50 C 40 40, 50 25, 50 25" fill="#1a2a6c" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Official Committee Stamp
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Digital seal will be auto-rendered onto the PDF certificate.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-[#1a2a6c] px-2 py-0.5 rounded font-mono font-bold">
                      SECURED
                    </span>
                  </div>

                  {/* Compile Trigger Button */}
                  <Button
                    variant="gold"
                    className="w-full text-base py-3 font-semibold shadow-md"
                    loading={isCompilingReport}
                    disabled={!chairmanValidated || !secretaryValidated}
                    icon={<FileCheck className="h-5 w-5" />}
                    onClick={handleCompilePDF}
                  >
                    {!chairmanValidated || !secretaryValidated 
                      ? 'Secure Signatures to Compile' 
                      : 'Compile Certified PDF Certificate'
                    }
                  </Button>
                </div>
              )}
            </Card>

            {/* 2. PDF Download Panel Card */}
            {state.reportGenerated && state.reportUrl && (
              <Card
                className="border border-emerald-200 bg-emerald-50/10 animate-fade-in"
                title="Integrity Report Ready!"
              >
                <div className="flex flex-col items-center text-center p-2">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3 shrink-0">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    PDF Document Compiled Successfully
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    The School of Engineering HND Projects Committee Plagiarism Certificate has been secured with digital timestamp credentials.
                  </p>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 w-full mt-6">
                    <a
                      href={state.reportUrl}
                      download={`DSPG_HND_Plagiarism_Report_${studentName.replace(/\s+/g, '_') || 'Student'}.pdf`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a2a6c] hover:bg-[#142054] text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                    <button
                      onClick={() => {
                        const win = window.open(state.reportUrl!, '_blank');
                        if (win) win.focus();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-300 rounded-lg shadow-xs transition-all active:scale-[0.98]"
                    >
                      <Printer className="h-4 w-4" />
                      Print / Open
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Full Width Certified Report Preview Simulator */}
        {state.status === 'complete' && state.result && (
          <div className="mt-8 animate-fade-in">
            <Card
              title="Certified Certificate Live Preview"
              subtitle="Inspect the live 4-page academic audit report. Updates to student metadata, signatory names, and digital signatures are reflected in real-time."
              headerAction={
                state.reportGenerated && state.reportUrl ? (
                  <a
                    href={state.reportUrl}
                    download={`DSPG_HND_Plagiarism_Report_${studentName.replace(/\s+/g, '_') || 'Student'}.pdf`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-150 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF Report
                  </a>
                ) : (
                  <Button
                    variant="gold"
                    size="sm"
                    className="text-xs font-bold"
                    loading={isCompilingReport}
                    onClick={async () => {
                      // Automatically validate signatures to streamline compile process
                      setChairmanValidated(true);
                      setSecretaryValidated(true);
                      setIsCompilingReport(true);
                      try {
                        await compilePDFReport({
                          ...committee,
                          chairmanName: committee.chairmanName || 'Engr. (Dr.) Benjamin Odoni',
                          secretaryName: committee.secretaryName || 'Engr. Brian Abugewa'
                        });
                      } catch (e) {
                        alert('Failed to compile PDF report.');
                      } finally {
                        setIsCompilingReport(false);
                      }
                    }}
                    icon={<Download className="h-3.5 w-3.5" />}
                  >
                    Compile & Download
                  </Button>
                )
              }
            >
              <PDFReport
                analysis={state}
                committee={committee}
                chairmanValidated={chairmanValidated}
                secretaryValidated={secretaryValidated}
              />
            </Card>
          </div>
        )}
      </div>

      <ReportFooter />
    </div>
  );
};
export default PlagiarismChecker;
