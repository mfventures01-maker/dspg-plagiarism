/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SourceMatch {
  text: string;
  source: string;
  similarity: number;
}

export interface AnalysisResult {
  originalityScore: number;
  aiProbability: number;
  flaggedSections: string[];
  summary: string;
  sources: SourceMatch[];
  wordCount: number;
  analysisDate: string;
  analysisDuration: string;
}

export interface AnalysisState {
  status: 'idle' | 'scanning' | 'complete' | 'error';
  text: string;
  fileName: string | null;
  result: AnalysisResult | null;
  reportGenerated: boolean;
  reportUrl: string | null;
  error?: string;
}

export interface CommitteeData {
  studentName: string;
  regNumber: string;
  projectTitle: string;
  supervisorName: string;
  chairmanName: string;
  chairmanSignature: string | null; // base64 representation of drawn/uploaded signature
  chairmanSignType: 'drawn' | 'typed' | 'uploaded';
  secretaryName: string;
  secretarySignature: string | null; // base64 representation of drawn/uploaded signature
  secretarySignType: 'drawn' | 'typed' | 'uploaded';
  approvalDate: string;
  stampImage: string | null; // base64 or preset
}
