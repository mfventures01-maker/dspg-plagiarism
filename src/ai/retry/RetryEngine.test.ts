/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { RetryEngine } from './RetryEngine';
import { RetryPolicy } from './RetryPolicy';
import { AIProviderError } from '../errors/AIProviderError';

async function runTests() {
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

  console.log('Running RetryEngine tests...\n');

  const policy: RetryPolicy = {
    maxAttempts: 3,
    initialDelayMs: 10,
    exponentialBackoff: true,
    multiplier: 2,
    retryableErrors: ['RATE_LIMIT', 'TIMEOUT']
  };

  await test('Successful execution without retry', async () => {
    const engine = new RetryEngine(policy);
    let calls = 0;
    
    const result = await engine.execute(async () => {
      calls++;
      return 'success';
    });

    assert.strictEqual(result.successful, true);
    assert.strictEqual(result.attempts, 1);
    assert.strictEqual(result.result, 'success');
    assert.strictEqual(calls, 1);
  });

  await test('Successful execution after retry', async () => {
    const engine = new RetryEngine(policy);
    let calls = 0;
    
    const result = await engine.execute(async () => {
      calls++;
      if (calls < 2) {
        throw new AIProviderError('Rate limited', 'Gemini', true, 'RATE_LIMIT');
      }
      return 'success';
    });

    assert.strictEqual(result.successful, true);
    assert.strictEqual(result.attempts, 2);
    assert.strictEqual(result.retryReasons.length, 1);
    assert.strictEqual(result.retryReasons[0], 'RATE_LIMIT');
  });

  await test('Retry exhaustion handled gracefully', async () => {
    const engine = new RetryEngine(policy);
    
    const result = await engine.execute(async () => {
      throw new AIProviderError('Timeout', 'Gemini', true, 'TIMEOUT');
    });

    assert.strictEqual(result.successful, false);
    assert.strictEqual(result.attempts, 3); // Max attempts
    assert.strictEqual(result.retryReasons.length, 3);
    assert.ok(result.finalError?.includes('Timeout'));
  });

  await test('Non-retryable failure immediate termination', async () => {
    const engine = new RetryEngine(policy);
    let calls = 0;
    
    const result = await engine.execute(async () => {
      calls++;
      // SERVER_ERROR is not in our policy array for this test
      throw new AIProviderError('Server Error', 'Gemini', true, 'SERVER_ERROR');
    });

    assert.strictEqual(result.successful, false);
    assert.strictEqual(result.attempts, 1); 
    assert.strictEqual(calls, 1);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
