/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { SearchQueryBuilder } from './SearchQueryBuilder';

function runTests() {
  const builder = new SearchQueryBuilder();
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

  console.log('Running SearchQueryBuilder tests...\n');

  test('Extracts keywords and removes duplicates', () => {
    const query = builder.buildQuery('Artificial intelligence and artificial life are cool');
    assert.strictEqual(query, 'artificial intelligence life cool');
  });

  test('Normalizes whitespace', () => {
    const query = builder.buildQuery('  Deep   learning   \n model  ');
    assert.strictEqual(query, 'deep learning model');
  });

  test('Removes stop words', () => {
    const query = builder.buildQuery('the quick brown fox and the lazy dog');
    assert.strictEqual(query, 'quick brown fox lazy dog');
  });

  test('Prevents empty searches - throws on empty string', () => {
    assert.throws(() => builder.buildQuery('   '), /Document text cannot be empty|Document text cannot contain only whitespace/);
  });

  test('Limits query length', () => {
    const longText = Array(50).fill('word').map((w, i) => `${w}${i}`).join(' ');
    const query = builder.buildQuery(longText);
    assert.ok(query.length <= 100);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
