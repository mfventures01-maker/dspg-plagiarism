/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SourceMatch {
  text: string;
  source: string;
  similarity: number;
}

export interface Sentence {
  id: string;
  startOffset: number;
  endOffset: number;
  wordCount: number;
  characterCount: number;
  text: string;
}

export interface Paragraph {
  id: string;
  sentenceIds: string[];
  startOffset: number;
  endOffset: number;
  text: string;
}

export interface NormalizedDocument {
  originalText: string;
  normalizedText: string;
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  language: string;
  documentHash: string; // SHA-256
  processedAt: string;
  sentences: Sentence[];
  paragraphs: Paragraph[];
  analysisDuration: string; // Time taken to process
}

export interface AnalysisState {
  status: 'idle' | 'scanning' | 'complete' | 'error';
  text: string;
  fileName: string | null;
  normalizedDoc: NormalizedDocument | null;
  reportGenerated: boolean;
  reportUrl: string | null;
  error?: string;
}

export interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
}

export interface Supervisor {
  name: string;
  title?: string;
  department?: string;
}

export interface ProjectMetadata {
  projectTitle: string;
  department: string;
  academicSession: string;
  supervisor: Supervisor;
  students: Student[];
}

export interface CommitteeData {
  projectMetadata: ProjectMetadata;
  chairmanName: string;
  chairmanSignature: string | null; // base64 representation of drawn/uploaded signature
  chairmanSignType: 'drawn' | 'typed' | 'uploaded';
  secretaryName: string;
  secretarySignature: string | null; // base64 representation of drawn/uploaded signature
  secretarySignType: 'drawn' | 'typed' | 'uploaded';
  approvalDate: string;
  stampImage: string | null; // base64 or preset
}
