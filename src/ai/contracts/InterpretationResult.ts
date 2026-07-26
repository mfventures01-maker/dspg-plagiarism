/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InterpretationResult {
  version: "1.0";
  plagiarismType:
    | "None"
    | "Direct"
    | "Paraphrased"
    | "Patchwork"
    | "Self";
  confidence: number;
  summary: string;
  evidenceExplanation: string[];
  lecturerComments: string;
  studentFeedback: string;
  recommendations: string[];
  
  // Observability metadata from the provider
  metadata?: {
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
