/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MatchingPassage {
  studentText: string;
  sourceText: string;
  similarity: number;
  sourceOffset: number;
  studentOffset: number;
  
  // Downstream compatibility fields
  studentChunkId?: string;
  candidateChunkId?: string;
  similarityScore?: number;
  matchedText?: string;
}

export interface EvidenceProvenance {
  providers: string[];
  retrievalTimestamp: string;
  evidenceVersion: string;
  similarityVersion: string;
}

export interface SimilarityEvidence {
  overallSimilarity: number;
  breakdown: {
    textSimilarity: number;
    semanticSimilarity: number;
    bibliographicOverlap: number;
    citationMatch: number;
    metadataSimilarity: number;
  };
  confidence: {
    level: "High" | "Medium" | "Low";
    score: number;
  };
  matchingPassages: MatchingPassage[];
  provenance: EvidenceProvenance;
  
  // Downstream compatibility fields
  provider?: string;
  providerId?: string;
  candidateId?: number;
  chunkScores?: number[];
  sentenceScores?: number[];
  matchingChunks?: any[];
}
