/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MatchingFragment {
  studentChunkId: string;
  candidateChunkId: string;
  similarity: number;
  matchedText: string;
}

export interface EvidenceSummary {
  candidatePaperId: number;
  overallSimilarity: number;
  metrics: {
    exactMatch: number;
    ngram: number;
    jaccard: number;
    cosine: number;
  };
  matchingFragments: MatchingFragment[];
}

export interface InterpretationInstructions {
  tasks: (
    | "classify-plagiarism"
    | "detect-paraphrasing"
    | "evaluate-citation"
    | "generate-summary"
    | "generate-feedback"
    | "recommend-actions"
  )[];
  responseFormat: "json";
}

export interface InterpretationRequest {
  version: "1.0";
  evidence: EvidenceSummary;
  instructions: InterpretationInstructions;
}
