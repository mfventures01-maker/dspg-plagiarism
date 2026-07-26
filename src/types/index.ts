/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper } from './CandidatePaper.js';
import { SimilarityEvidence, EvidenceProvenance } from './SimilarityEvidence.js';

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

export interface AIAnalysis {
  verdict: 'Original' | 'Suspicious' | 'Plagiarism Detected';
  similarityScore: number;
  reasoning: string;
  recommendations: string[];
  provider: string;
  model: string;
  durationMs: number;
}

export interface AnalysisResult {
  document: NormalizedDocument;
  aiAnalysis?: AIAnalysis;
  federationMetrics?: any;
  candidatePapers?: CandidatePaper[];
  [key: string]: any;
}

export interface AnalysisState {
  status: 'idle' | 'scanning' | 'complete' | 'error';
  text: string;
  fileName: string | null;
  normalizedDoc: AnalysisResult | null;
  reportGenerated: boolean;
  reportUrl: string | null;
  error?: string;
}

import { Student } from '../models/Student';
import { ProjectMetadata } from '../models/ProjectMetadata';

export type { Student, ProjectMetadata };

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

export * from './CandidatePaper';
export * from './SimilarityEvidence';

export interface EvidencePackage {
  studentDocument: {
    title?: string;
    wordCount: number;
    chunkCount: number;
  };
  candidatePaper: CandidatePaper;
  similarity: SimilarityEvidence;
  confidence: {
    level: "High" | "Medium" | "Low";
    score: number;
  };
  provenance: EvidenceProvenance;
  generatedAt: string;

  // Downstream compatibility fields
  metrics: {
    exactMatch: number;
    ngram: number;
    jaccard: number;
    cosine: number;
    textSimilarity?: number;
    semanticSimilarity?: number;
    bibliographicOverlap?: number;
    citationMatch?: number;
  };
  matchingFragments: any[];
}

export const MODEL_VERSION = "2.1";

export interface EvidenceAssessment {
  retrievalState:
    | "SUCCESS_WITH_CANDIDATES"
    | "SUCCESS_NO_CANDIDATES"
    | "PARTIAL_SUCCESS"
    | "PROVIDER_FAILURE";

  similarityState:
    | "MATCH_FOUND"
    | "NO_MATCH"
    | "NOT_MEASURABLE";

  core: {
    retrieved: number;
    accepted: number;
    latencyMs: number;
    status: string;
  };

  openAlex: {
    retrieved: number;
    accepted: number;
    latencyMs: number;
    status: string;
  };

  evidence: any[];
  confidence: number;
}
