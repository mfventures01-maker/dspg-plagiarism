/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { GeminiProvider } from './GeminiProvider';
import { InterpretationRequest } from '../contracts/InterpretationRequest';

// NOTE: We don't execute full network calls in unit tests to preserve isolation.
// But we can test initialization and validation failures.

function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        res.then(() => {
          passed++;
          console.log(`✅ ${name}`);
        }).catch(err => {
          failed++;
          console.error(`❌ ${name}`);
          console.error(err);
        });
      } else {
        passed++;
        console.log(`✅ ${name}`);
      }
    } catch (error) {
      failed++;
      console.error(`❌ ${name}`);
      console.error(error);
    }
  }

  console.log('Running GeminiProvider tests...\n');

  test('Instantiates successfully', async () => {
    const provider = new GeminiProvider();
    assert.strictEqual(provider.name, 'Gemini');
  });

  // We could mock fetch here to test validation logic of InterpretationResult
  
  // Need to use process.on('exit') to handle async test reporting correctly 
  // since we didn't block on promises in this lightweight test runner.
  setTimeout(() => {
    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exit(1);
    }
  }, 100);
}

runTests();
