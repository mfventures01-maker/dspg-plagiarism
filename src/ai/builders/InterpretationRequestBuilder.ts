/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvidencePackage } from '../../services/evidence/EvidencePackageBuilder';
import { InterpretationRequest, EvidenceSummary, InterpretationInstructions } from '../contracts/InterpretationRequest';

/**
 * Single Responsibility: Transform internal EvidencePackage into the public AI contract.
 * No AI. No prompt generation. No similarity calculations. No evidence mutation.
 */
export class InterpretationRequestBuilder {
  
  public buildRequest(evidencePkg: EvidencePackage, tasks: InterpretationInstructions['tasks']): InterpretationRequest {
    
    const summary: EvidenceSummary = {
      candidatePaperId: evidencePkg.candidatePaper.coreId,
      overallSimilarity: evidencePkg.similarity.overallSimilarity,
      metrics: {
        exactMatch: evidencePkg.metrics.exactMatch,
        ngram: evidencePkg.metrics.ngram,
        jaccard: evidencePkg.metrics.jaccard,
        cosine: evidencePkg.metrics.cosine
      },
      matchingFragments: evidencePkg.matchingFragments.map(f => ({
        studentChunkId: f.studentChunkId,
        candidateChunkId: f.candidateChunkId,
        similarity: f.similarity,
        matchedText: f.matchedText
      }))
    };

    return {
      version: "1.0",
      evidence: summary,
      instructions: {
        tasks,
        responseFormat: "json"
      }
    };
  }
}
