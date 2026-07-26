/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { CandidatePaperProvider } from './CandidatePaperProvider';

async function runTests() {
  const provider = new CandidatePaperProvider();
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.error(`❌ ${name}`);
      console.error(error);
    }
  }

  console.log('Running CandidatePaperProvider tests...\n');

  // Skip actual network call tests here to keep unit tests fast and deterministic.
  // We mock CoreSearchService in a robust setup, but for now we verify instantiation 
  // and error handling for empty documents.
  
  await test('Throws on empty document', async () => {
    await assert.rejects(
      async () => await provider.getCandidates('   '),
      /Document text cannot be empty|Document text cannot contain only whitespace/
    );
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
