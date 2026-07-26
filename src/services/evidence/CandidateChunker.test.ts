/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { CandidateChunker } from './CandidateChunker';
import { CandidatePaper } from '../../types';

function runTests() {
  const chunker = new CandidateChunker({ chunkSize: 20, overlap: 5 });
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

  console.log('Running CandidateChunker tests...\n');

  test('Chunks abstract identically to DocumentChunker', () => {
    const paper: CandidatePaper = {
      provider: 'CORE',
      providerId: '999',
      coreId: 999,
      title: 'A title',
      authors: [{ name: 'Author A' }],
      institutions: [],
      citationCount: 0,
      concepts: [],
      keywords: [],
      subjects: [],
      fullTextAvailable: false,
      metadata: {},
      abstract: 'This is a longer text that needs splitting'
    };

    const chunks = chunker.chunk(paper);
    assert.ok(chunks.length > 1);
    assert.strictEqual(chunks[0].candidateId, 999);
    assert.strictEqual(chunks[0].chunkId, '999_chunk_0');
    
    // Ensure deterministic identical runs
    const chunksRun2 = chunker.chunk(paper);
    assert.deepStrictEqual(chunks, chunksRun2);
  });

  test('Falls back to title if abstract missing', () => {
    const paper: CandidatePaper = {
      provider: 'CORE',
      providerId: '888',
      coreId: 888,
      title: 'Short title',
      authors: [{ name: 'Author B' }],
      institutions: [],
      citationCount: 0,
      concepts: [],
      keywords: [],
      subjects: [],
      fullTextAvailable: false,
      metadata: {}
    };

    const chunks = chunker.chunk(paper);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].text, 'Short title');
    assert.strictEqual(chunks[0].candidateId, 888);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
