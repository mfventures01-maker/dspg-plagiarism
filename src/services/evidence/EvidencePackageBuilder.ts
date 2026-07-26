/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidatePaper, SimilarityEvidence, MatchingPassage, EvidencePackage } from '../../types';
export type { EvidencePackage };

/**
 * Single Responsibility: Convert deterministic similarity output into the canonical
 * evidence package. No AI. No heuristic scoring. No HTTP requests.
 */
export class EvidencePackageBuilder {
  
  /**
   * Packages the evidence deterministically.
   */
  public build(
    documentText: string,
    documentTitle: string | undefined,
    chunkCount: number,
    candidatePaper: CandidatePaper,
    similarityResult: SimilarityEvidence
  ): EvidencePackage {
    
    // Calculate simple word count (deterministic split by whitespace)
    const wordCount = documentText.trim().length > 0 
      ? documentText.trim().split(/\s+/).length 
      : 0;

    return {
      studentDocument: {
        title: documentTitle,
        wordCount,
        chunkCount
      },
      candidatePaper,
      similarity: similarityResult,
      confidence: similarityResult.confidence,
      provenance: similarityResult.provenance,
      generatedAt: new Date().toISOString(),
      
      // Downstream compatibility fields
      metrics: {
        exactMatch: similarityResult.breakdown.textSimilarity,
        ngram: similarityResult.breakdown.citationMatch,
        jaccard: similarityResult.breakdown.semanticSimilarity,
        cosine: similarityResult.breakdown.textSimilarity
      },
      matchingFragments: similarityResult.matchingPassages
    };
  }
}
