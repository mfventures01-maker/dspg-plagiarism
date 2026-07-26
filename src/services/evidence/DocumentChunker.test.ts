/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { DocumentChunker } from './DocumentChunker';

function runTests() {
  const chunker = new DocumentChunker({ chunkSize: 20, overlap: 5 });
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

  console.log('Running DocumentChunker tests...\n');

  test('Empty document returns empty array', () => {
    const chunks = chunker.chunk('doc1', '   ');
    assert.strictEqual(chunks.length, 0);
  });

  test('Single small paragraph returns one chunk', () => {
    const chunks = chunker.chunk('doc2', 'short text');
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].text, 'short text');
    assert.strictEqual(chunks[0].id, 'doc2_chunk_0');
    assert.strictEqual(chunks[0].index, 0);
  });

  test('Large document chunks correctly with overlap', () => {
    // 20 chars chunk size, 5 overlap
    // "This is a longer text that needs splitting"
    // "This is a longer " (17) -> overlap 5 is "nger ", next word boundary is "text" -> "text that needs " (16)
    const chunks = chunker.chunk('doc3', 'This is a longer text that needs splitting');
    assert.ok(chunks.length > 1);
    assert.strictEqual(chunks[0].id, 'doc3_chunk_0');
    assert.strictEqual(chunks[1].id, 'doc3_chunk_1');
    // Ensure deterministic identical runs
    const chunksRun2 = chunker.chunk('doc3', 'This is a longer text that needs splitting');
    assert.deepStrictEqual(chunks, chunksRun2);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
