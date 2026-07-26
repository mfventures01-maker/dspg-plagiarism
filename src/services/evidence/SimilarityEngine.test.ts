/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { SimilarityEngine } from './SimilarityEngine';
import { DocumentChunk } from './DocumentChunker';
import { CandidateChunk } from './CandidateChunker';
import { CandidatePaper } from '../../types';

const mockPaper1: CandidatePaper = {
  provider: 'CORE',
  providerId: 'mock-1',
  title: 'Mock Publication 1',
  authors: [{ name: 'Author A' }],
  institutions: [],
  citationCount: 0,
  concepts: [],
  keywords: [],
  subjects: [],
  fullTextAvailable: false,
  metadata: {},
  coreId: 1
};

const mockPaper2: CandidatePaper = {
  provider: 'OpenAlex',
  providerId: 'mock-2',
  title: 'Mock Publication 2',
  authors: [{ name: 'Author B' }],
  institutions: [],
  citationCount: 0,
  concepts: [],
  keywords: [],
  subjects: [],
  fullTextAvailable: false,
  metadata: {},
  coreId: 2
};

function runTests() {
  const engine = new SimilarityEngine();
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

  console.log('Running SimilarityEngine tests...\n');

  test('Identical chunks yield high similarity', () => {
    const text = 'This is a deterministically identical chunk of text.';
    const sChunks: DocumentChunk[] = [{ id: 's1', index: 0, text }];
    const cChunks: CandidateChunk[] = [{ candidateId: 1, chunkId: 'c1', index: 0, text }];

    const result = engine.computeSimilarity(mockPaper1, sChunks, cChunks);
    
    assert.strictEqual(result.provenance.providers[0], 'CORE');
    assert.ok(result.overallSimilarity > 0.99); // Due to precision limits
    assert.ok(result.breakdown.textSimilarity > 0.99 || text.split('.').length < 2);
    assert.ok(result.breakdown.metadataSimilarity >= 0);
    assert.strictEqual(result.matchingPassages.length, 1);
  });

  test('Empty chunks yield zero similarity', () => {
    const result = engine.computeSimilarity(mockPaper2, [], []);
    assert.strictEqual(result.overallSimilarity, 0);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
