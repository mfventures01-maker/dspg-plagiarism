/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { InterpretationRequestBuilder } from './InterpretationRequestBuilder';
import { EvidencePackage } from '../../services/evidence/EvidencePackageBuilder';

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.error(`❌ ${name}`);
      console.error(error);
    }
  }

  console.log('Running InterpretationRequestBuilder tests...\n');

  test('Transforms EvidencePackage to InterpretationRequest correctly', () => {
    const builder = new InterpretationRequestBuilder();
    const pkg: any = {
      studentDocument: { wordCount: 10, chunkCount: 1 },
      candidatePaper: { coreId: 101, title: 'Paper', authors: [] },
      similarity: {
        candidateId: 101,
        overallSimilarity: 0.9,
        metrics: { exactMatch: 0.1, ngram: 0.2, jaccard: 0.3, cosine: 0.4 },
        matchingChunks: [
          { studentChunkId: 's1', candidateChunkId: 'c1', similarity: 0.8, matchedText: 'match' }
        ]
      },
      matchingFragments: [
        { studentChunkId: 's1', candidateChunkId: 'c1', similarity: 0.8, matchedText: 'match' }
      ],
      metrics: { exactMatch: 0.1, ngram: 0.2, jaccard: 0.3, cosine: 0.4 },
      generatedAt: '2026-07-22T00:00:00Z'
    };

    const req = builder.buildRequest(pkg, ['classify-plagiarism']);

    assert.strictEqual(req.version, '1.0');
    assert.strictEqual(req.instructions.responseFormat, 'json');
    assert.deepStrictEqual(req.instructions.tasks, ['classify-plagiarism']);
    assert.strictEqual(req.evidence.candidatePaperId, 101);
    assert.strictEqual(req.evidence.overallSimilarity, 0.9);
    assert.strictEqual(req.evidence.metrics.cosine, 0.4);
    assert.strictEqual(req.evidence.matchingFragments.length, 1);
    
    // Ensure no internal details leaked
    assert.strictEqual((req.evidence as any).candidatePaper, undefined);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
