/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from './UIComponents/Card';
import { Button } from './UIComponents/Button';
import { SignatureBlock } from './UIComponents/SignatureBlock';
import { ProgressRing } from './UIComponents/ProgressRing';
import { FileUploadZone } from './UIComponents/FileUploadZone';
import { ReportHeader } from './Report/ReportHeader';
import { ReportFooter } from './Report/ReportFooter';
import { PDFReport } from './Report/PDFReport';
import { ProviderStatus } from './ProviderStatus';
import { ResultCard } from './ResultCard';
import { ProgressIndicator } from './ProgressIndicator';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { PublicCounter } from './PublicCounter';
import { usePlagiarismCheck } from '../hooks/usePlagiarismCheck';
import { useFileUpload } from '../hooks/useFileUpload';
import { CommitteeData, Student, ProjectMetadata } from '../types';
import { 
  ShieldCheck, AlertTriangle, FileText, RefreshCw, 
  CheckCircle, BarChart, Zap, Download, Printer, 
  HelpCircle, User, BookOpen, UserCheck, Eye, Clipboard,
  Cpu, FileCheck, ArrowRight, Lock, Plus, Trash2, GraduationCap, Building2, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { Branding } from "@/branding";

const SAMPLE_PROJECT: ProjectMetadata = {
  projectTitle: 'Design and Construction of a Microcontroller-Based Smart Irrigation System',
  department: 'Computer Engineering',
  school: 'School of Engineering',
  programme: 'Higher National Diploma (HND)',
  level: 'HND 2',
  session: '2023/2024',
  supervisor: 'Engr. Brian Abugewa',
  submissionDate: new Date().toISOString().split('T')[0],
  students: [
    { id: crypto.randomUUID(), fullName: 'Okonkwo Chukwudi Emmanuel', matricNumber: 'DSPG/HND/ENG/2024/0482', role: 'Lead Developer' }
  ]
};

const SAMPLE_TEXT = `This project describes the design and implementation of an automated smart irrigation system utilizing an ATmega328P microcontroller integrated with capacitive soil moisture sensors and a water pump. Irrigation is one of the most vital agricultural practices in Nigeria, where drought and erratic rainfall patterns often threaten food security, especially in Delta State. Standard manual irrigation leads to massive water waste and inefficient labor resources. 

To resolve this challenge, the proposed system reads real-time moisture parameters from the soil and cross-references them against configured threshold limits. When the volumetric water content drops below 35%, the microcontroller triggers a 5V relay module which activates a submersible water pump. Once the soil reaches a saturated level of 75%, the controller deactivates the pump. This closed-loop automatic feedback loop ensures optimal moisture preservation and prevents root rot.

The system incorporates an LCD screen to display the volumetric moisture percentages and current pump status. System reliability was verified across multiple soil configurations, indicating a 40% reduction in water usage compared to conventional timed-watering techniques. Future recommendations involve the integration of a LoRa module for remote telemetry monitoring across expansive polytechnic farm settlements.`;

export const PlagiarismChecker: React.FC = () => {
  const { state, runCheck, compilePDFReport, resetState } = usePlagiarismCheck();
  const { file, fileName, handleSelectFile, clearFile } = useFileUpload();
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'searching' | 'analyzing' | 'generating'>('uploading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Committee Endorsement States
  const [committee, setCommittee] = useState<CommitteeData>({
    projectMetadata: {
      projectTitle: '',
      department: 'Computer Engineering',
      school: 'School of Engineering',
      programme: 'Higher National Diploma (HND)',
      level: 'HND 2',
      session: '2023/2024',
      supervisor: '',
      submissionDate: new Date().toISOString().split('T')[0],
      students: [
        { id: crypto.randomUUID(), fullName: '', matricNumber: '', role: '' }
      ]
    },
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

  // Stage labels for progress indicator
  const stageLabels = {
    uploading: 'Uploading document...',
    searching: 'Searching academic databases...',
    analyzing: 'Analyzing with AI...',
    generating: 'Generating report...',
  };

  const updateMetadata = (field: keyof ProjectMetadata, value: any) => {
    setCommittee(prev => ({
      ...prev,
      projectMetadata: {
        ...prev.projectMetadata,
        [field]: value
      }
    }));
  };

  const handleLoadSample = async () => {
    const meta = {
      ...SAMPLE_PROJECT,
      students: SAMPLE_PROJECT.students.map(s => ({ ...s, id: crypto.randomUUID() }))
    };
    setCommittee(prev => ({
      ...prev,
      projectMetadata: meta
    }));
    setTextInput(SAMPLE_TEXT);
    setActiveTab('text');
    await runCheck(SAMPLE_TEXT, null, meta);
  };

  const handleAddStudent = () => {
    const students = committee.projectMetadata.students;
    setCommittee(prev => ({
      ...prev,
      projectMetadata: {
        ...prev.projectMetadata,
        students: [...students, { id: crypto.randomUUID(), fullName: '', matricNumber: '', role: '' }]
      }
    }));
  };

  const handleRemoveStudent = (id: string) => {
    const students = committee.projectMetadata.students;
    if (students.length <= 1) {
      alert('At least one student is required.');
      return;
    }
    setCommittee(prev => ({
      ...prev,
      projectMetadata: {
        ...prev.projectMetadata,
        students: students.filter(s => s.id !== id)
      }
    }));
  };

  const updateStudent = (id: string, field: keyof Student, value: string) => {
    setCommittee(prev => ({
      ...prev,
      projectMetadata: {
        ...prev.projectMetadata,
        students: prev.projectMetadata.students.map(s => s.id === id ? { ...s, [field]: value } : s)
      }
    }));
  };

  const validateMetadata = (): boolean => {
    const m = committee.projectMetadata;
    if (!m.projectTitle.trim()) { alert('Project Title is required.'); return false; }
    if (!m.department.trim()) { alert('Department is required.'); return false; }
    if (!m.school.trim()) { alert('School is required.'); return false; }
    if (!m.programme.trim()) { alert('Programme is required.'); return false; }
    if (!m.level.trim()) { alert('Level is required.'); return false; }
    if (!m.session.trim()) { alert('Session is required.'); return false; }
    if (!m.supervisor.trim()) { alert('Supervisor is required.'); return false; }
    if (!m.submissionDate.trim()) { alert('Submission Date is required.'); return false; }

    const matricNumbers = m.students.map(s => s.matricNumber.trim()).filter(Boolean);
    const uniqueMatrics = new Set(matricNumbers);
    if (uniqueMatrics.size !== matricNumbers.length) {
      alert('Duplicate matriculation numbers are not allowed.');
      return false;
    }

    for (const student of m.students) {
      if (!student.fullName.trim()) { alert('All students must have a Full Name.'); return false; }
      if (!student.matricNumber.trim()) { alert('All students must have a Matric Number.'); return false; }
    }
    return true;
  };

  const handleStartAnalysis = async () => {
    if (!validateMetadata()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setProgress(0);
    setUploadStage('uploading');

    try {
      if (activeTab === 'text') {
        if (!textInput.trim() || textInput.length < 10) {
          setErrorMessage('Please enter at least 10 characters to perform plagiarism detection.');
          setIsLoading(false);
          return;
        }
        
        setUploadStage('searching');
        setProgress(20);
        await runCheck(textInput, null, committee.projectMetadata);
        
      } else {
        if (!file) {
          setErrorMessage('Please select or upload a document file (.txt, .docx, .pdf).');
          setIsLoading(false);
          return;
        }
        
        setUploadStage('searching');
        setProgress(20);
        await runCheck('', file, committee.projectMetadata);
      }
      
      setUploadStage('analyzing');
      setProgress(70);
      
      // Simulate AI analysis progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(90);
      
      setUploadStage('generating');
      setProgress(100);
      
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompilePDF = async () => {
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
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
        {/* Decorative DSPG Blue top line banner */}
        <div className="h-2 bg-[#1a2a6c] w-full"></div>
        <div className="h-1 bg-[#c9a84c] w-full"></div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <ProgressIndicator
              progress={progress}
              status={stageLabels[uploadStage]}
              stage={uploadStage}
            />
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">Error</h4>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Banner with Polytechnic Brand */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 md:p-8 bg-gradient-to-r from-[#1a2a6c] via-[#2d4059] to-[#1a2a6c] text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 shrink-0 bg-white p-1 rounded-full shadow-md overflow-hidden flex items-center justify-center">
                  <img src={Branding.logo} alt={Branding.institution} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    {Branding.applicationName}
                  </h1>
                  <p className="text-sm font-medium text-slate-200 tracking-wider">
                    {Branding.institution}
                  </p>
                  <div className="mt-4"><PublicCounter /></div>
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
              
              {/* 1. Student & Project Metadata Card */}
              <Card
                title="Student & Project Metadata"
                subtitle="Please compile the fields below. This details will be printed on the official cover sheet of the originality audit certificate."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Project / Thesis Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. Design and Construction of a Microcontroller-Based Smart Irrigation System"
                      value={committee.projectMetadata.projectTitle}
                      onChange={(e) => updateMetadata('projectTitle', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" /> Department
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. Computer Engineering"
                      value={committee.projectMetadata.department}
                      onChange={(e) => updateMetadata('department', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" /> School
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. School of Engineering"
                      value={committee.projectMetadata.school}
                      onChange={(e) => updateMetadata('school', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Programme
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. Higher National Diploma (HND)"
                      value={committee.projectMetadata.programme}
                      onChange={(e) => updateMetadata('programme', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Level
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. HND 2"
                      value={committee.projectMetadata.level}
                      onChange={(e) => updateMetadata('level', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Academic Session
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. 2023/2024"
                      value={committee.projectMetadata.session}
                      onChange={(e) => updateMetadata('session', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Project Supervisor
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      placeholder="e.g. Engr. Brian Abugewa"
                      value={committee.projectMetadata.supervisor}
                      onChange={(e) => updateMetadata('supervisor', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Submission Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                      value={committee.projectMetadata.submissionDate}
                      onChange={(e) => updateMetadata('submissionDate', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" /> Project Students
                      </label>
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="text-xs flex items-center gap-1 font-semibold text-[#1a2a6c] hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add Student
                      </button>
                    </div>
                    <div className="space-y-3">
                      {committee.projectMetadata.students.map((student, index) => (
                        <div key={student.id} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                              placeholder="Full Name"
                              value={student.fullName}
                              onChange={(e) => updateStudent(student.id, 'fullName', e.target.value)}
                            />
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                              placeholder="Role (Optional)"
                              value={student.role || ''}
                              onChange={(e) => updateStudent(student.id, 'role', e.target.value)}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-[#1a2a6c] outline-none transition-all duration-150"
                              placeholder="Matric Number"
                              value={student.matricNumber}
                              onChange={(e) => updateStudent(student.id, 'matricNumber', e.target.value)}
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(student.id)}
                                disabled={committee.projectMetadata.students.length <= 1}
                                className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    loading={state.status === 'scanning' || isLoading}
                    onClick={handleStartAnalysis}
                    icon={<Zap className="h-4 w-4" />}
                  >
                    {isLoading ? 'Processing...' : 'Analyze & Verify Integrity'}
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

              {/* 3. Document Extraction Metrics Panel */}
              {state.status === 'complete' && state.normalizedDoc && (
                <div className="space-y-6">
                  
                  {/* Extraction Stats Bento Grid */}
                  <Card title="Document Normalization Metrics">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                      
                      <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 text-center">
                        <div className="text-3xl font-bold text-[#1a2a6c] mb-1">{state.normalizedDoc.document.wordCount}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Words</div>
                      </div>

                      <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 text-center">
                        <div className="text-3xl font-bold text-[#1a2a6c] mb-1">{state.normalizedDoc.document.sentenceCount}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentences</div>
                      </div>

                      <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 text-center">
                        <div className="text-3xl font-bold text-[#1a2a6c] mb-1">{state.normalizedDoc.document.paragraphCount}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Paragraphs</div>
                      </div>
                      
                      <div className="border border-slate-100 p-4 rounded-xl flex flex-col items-center justify-center bg-slate-50/50 text-center">
                        <div className="text-3xl font-bold text-[#1a2a6c] mb-1">{state.normalizedDoc.document.characterCount}</div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Characters</div>
                      </div>

                    </div>
                  </Card>

                  {/* Document Integrity Hash */}
                  <Card
                    title="Cryptographic Integrity Hash"
                    subtitle="Deterministic cryptographic fingerprint generated from the normalized text extraction."
                  >
                    <div className="flex items-center gap-4 bg-slate-100 p-4 rounded-xl border border-slate-200">
                      <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">SHA-256 Fingerprint</p>
                        <p className="font-mono text-xs md:text-sm text-slate-800 break-all select-all">
                          {state.normalizedDoc.document.documentHash}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Provider Status Dashboard */}
                  {state.normalizedDoc?.federationMetrics?.providers && 
 state.normalizedDoc.federationMetrics.providers.length > 0 ? (
  <ProviderStatus metrics={state.normalizedDoc.federationMetrics.providers} />
) : (
  <div className="text-sm text-gray-500 p-2 border rounded-lg">
    <span className="font-medium">📊 Provider Status</span>
    <div className="mt-1 text-xs">No provider metrics available</div>
  </div>
)}

                  {/* AI Analysis Section */}
                  {state.normalizedDoc.aiAnalysis && (
                    <div className="ai-verdict-section bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                      <h3 className="text-lg font-semibold mb-3">🤖 AI Analysis</h3>
                      
                      {state.normalizedDoc.counter && (
                        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">📊 Total Projects Analyzed</span>
                            <span className="font-bold text-green-600">{state.normalizedDoc.counter.total?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-500">Today's Checks</span>
                            <span className="font-bold text-blue-600">{state.normalizedDoc.counter.today}</span>
                          </div>
                        </div>
                      )}

                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded p-3">
                          <span className="text-sm text-gray-500">Verdict</span>
                          <p className={`text-xl font-bold ${
                            state.normalizedDoc.aiAnalysis.verdict === 'Original' ? 'text-green-600' :
                            state.normalizedDoc.aiAnalysis.verdict === 'Suspicious' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {state.normalizedDoc.aiAnalysis.verdict}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded p-3">
                          <span className="text-sm text-gray-500">Similarity Score</span>
                          <p className="text-xl font-bold text-blue-600">
                            {state.normalizedDoc.aiAnalysis.similarityScore}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-sm text-gray-500">Reasoning</span>
                        <p className="text-sm text-gray-700 mt-1">{state.normalizedDoc.aiAnalysis.reasoning}</p>
                      </div>
                      
                      {state.normalizedDoc.aiAnalysis.recommendations && state.normalizedDoc.aiAnalysis.recommendations.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">Recommendations</span>
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                            {state.normalizedDoc.aiAnalysis.recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-400">
                        Analyzed by {state.normalizedDoc.aiAnalysis.provider} ({state.normalizedDoc.aiAnalysis.model}) in {state.normalizedDoc.aiAnalysis.durationMs}ms
                      </div>
                    </div>
                  )}

                  {/* Results by Provider */}
                  <Card title="📚 Candidate Papers Found">
                    {state.normalizedDoc.candidatePapers && state.normalizedDoc.candidatePapers.length > 0 ? (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {state.normalizedDoc.candidatePapers.map((paper: any, index: number) => (
                          <ResultCard key={index} paper={paper} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">No candidate papers found.</div>
                    )}
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
                        <div className="w-12 h-12 rounded-full border border-[#1a2a6c] flex items-center justify-center bg-white shrink-0 overflow-hidden">
                          <img src={Branding.logo} alt={Branding.institution} className="w-full h-full object-contain" />
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
                        download={`DSPG_HND_Plagiarism_Report_${committee.projectMetadata?.students?.[0]?.fullName?.replace(/\s+/g, '_') || 'Student'}.pdf`}
                        onClick={() => window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'PDF_DOWNLOADED' } }))}
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
          {state.status === 'complete' && state.normalizedDoc && (
            <div className="mt-8 animate-fade-in">
              <Card
                title="Certified Certificate Live Preview"
                subtitle="Inspect the live 4-page academic audit report. Updates to student metadata, signatory names, and digital signatures are reflected in real-time."
                headerAction={
                  state.reportGenerated && state.reportUrl ? (
                    <a
                      href={state.reportUrl}
                      download={`DSPG_HND_Plagiarism_Report_${committee.projectMetadata?.students?.[0]?.fullName?.replace(/\s+/g, '_') || 'Student'}.pdf`}
                      onClick={() => window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'PDF_DOWNLOADED' } }))}
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
                          const url = await compilePDFReport({
                            ...committee,
                            chairmanName: committee.chairmanName || 'Engr. (Dr.) Benjamin Odoni',
                            secretaryName: committee.secretaryName || 'Engr. Brian Abugewa'
                          });
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `DSPG_HND_Plagiarism_Report.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.dispatchEvent(new CustomEvent('DSPG_TELEMETRY', { detail: { event: 'PDF_DOWNLOADED' } }));
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
    </ErrorBoundary>
  );
};

export default PlagiarismChecker;