/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { ProviderFailoverEngine } from './ProviderFailoverEngine';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { RetryEngine } from '../retry/RetryEngine';
import { AIProviderError } from '../errors/AIProviderError';
import { InterpretationRequest } from '../contracts/InterpretationRequest';
import { InterpretationResult } from '../contracts/InterpretationResult';
import { AIProvider } from '../interfaces/AIProvider';
import { RateLimitError, AuthenticationError } from '../errors/AIErrors';

class MockProvider implements AIProvider {
  public name: string;
  public calls = 0;
  private failType?: string;
  
  constructor(name: string, failType?: string) {
    this.name = name;
    this.failType = failType;
  }
  
  async initialize(): Promise<void> {}
  async healthCheck(): Promise<boolean> { return true; }
  async calculateSimilarity(): Promise<number> { return 0; }
  async detectAI(): Promise<number> { return 0; }
  async shutdown(): Promise<void> {}

  async analyzeDocument(request: any): Promise<any> {
    this.calls++;
    if (this.failType === 'RETRYABLE') {
      throw new RateLimitError(this.name, 'Rate limit');
    } else if (this.failType === 'CONFIG') {
      throw new AuthenticationError(this.name, 'Auth Failed');
    }
    return {
      success: true,
      provider: this.name,
      model: 'mock-model',
      durationMs: 10,
      data: {
        version: '1.0',
        plagiarismType: 'Direct',
        confidence: 0.99,
        summary: 'test',
        evidenceExplanation: ['test'],
        lecturerComments: 'test',
        studentFeedback: 'test',
        recommendations: ['test'],
        metadata: { provider: this.name, model: 'mock-model', promptTokens: 10, completionTokens: 10, totalTokens: 20 }
      }
    };
  }
}

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

  console.log('Running ProviderFailoverEngine tests...\n');

  const retryEngine = new RetryEngine({
    maxAttempts: 2, initialDelayMs: 10, exponentialBackoff: false, multiplier: 1, retryableErrors: ['RATE_LIMIT', 'TIMEOUT', 'SERVER_ERROR', 'NETWORK_ERROR']
  });

  await test('Gemini succeeds without failover', async () => {
    const registry = new ProviderRegistry();
    const gemini = new MockProvider('gemini');
    const nvidia = new MockProvider('nvidia');
    registry.register({ id: 'gemini', provider: 'Gemini', model: 'v1', priority: 1, enabled: true }, gemini);
    registry.register({ id: 'nvidia', provider: 'NVIDIA', model: 'v1', priority: 2, enabled: true }, nvidia);
    
    const engine = new ProviderFailoverEngine(registry, retryEngine);
    const result = await engine.execute((p) => p.analyzeDocument({} as any));

    assert.strictEqual(result.successful, true);
    assert.strictEqual(result.provider, 'gemini');
    assert.strictEqual(result.fallbacksUsed, 0);
    assert.strictEqual(gemini.calls, 1);
    assert.strictEqual(nvidia.calls, 0);
  });

  await test('Gemini exhausted then NVIDIA success', async () => {
    const registry = new ProviderRegistry();
    const gemini = new MockProvider('gemini', 'RETRYABLE'); // Will fail 2 times
    const nvidia = new MockProvider('nvidia');
    registry.register({ id: 'gemini', provider: 'Gemini', model: 'v1', priority: 1, enabled: true }, gemini);
    registry.register({ id: 'nvidia', provider: 'NVIDIA', model: 'v1', priority: 2, enabled: true }, nvidia);
    
    const engine = new ProviderFailoverEngine(registry, retryEngine);
    const result = await engine.execute((p) => p.analyzeDocument({} as any));

    assert.strictEqual(result.successful, true);
    assert.strictEqual(result.provider, 'nvidia');
    assert.strictEqual(result.fallbacksUsed, 1);
    assert.strictEqual(gemini.calls, 2); // Exhausted retries
    assert.strictEqual(nvidia.calls, 1); // Succeeded immediately
  });

  await test('Configuration error (no failover)', async () => {
    const registry = new ProviderRegistry();
    const gemini = new MockProvider('gemini', 'CONFIG'); // Hard fail
    const nvidia = new MockProvider('nvidia');
    registry.register({ id: 'gemini', provider: 'Gemini', model: 'v1', priority: 1, enabled: true }, gemini);
    registry.register({ id: 'nvidia', provider: 'NVIDIA', model: 'v1', priority: 2, enabled: true }, nvidia);
    
    const engine = new ProviderFailoverEngine(registry, retryEngine);
    
    try {
      await engine.execute((p) => p.analyzeDocument({} as any));
      assert.fail('Should have thrown config error');
    } catch (e: any) {
      assert.strictEqual(e.name, 'Error'); // Regular error, not AIUnavailable
      assert.ok(e.message.includes('Auth Failed'));
    }
    
    assert.strictEqual(gemini.calls, 1);
    assert.strictEqual(nvidia.calls, 0); // Never failed over
  });

  await test('Gemini exhausted then NVIDIA exhausted (AI_UNAVAILABLE)', async () => {
    const registry = new ProviderRegistry();
    const gemini = new MockProvider('gemini', 'RETRYABLE'); 
    const nvidia = new MockProvider('nvidia', 'RETRYABLE'); 
    registry.register({ id: 'gemini', provider: 'Gemini', model: 'v1', priority: 1, enabled: true }, gemini);
    registry.register({ id: 'nvidia', provider: 'NVIDIA', model: 'v1', priority: 2, enabled: true }, nvidia);
    
    const engine = new ProviderFailoverEngine(registry, retryEngine);
    
    try {
      await engine.execute((p) => p.analyzeDocument({} as any));
      assert.fail('Should have thrown AIUnavailableError');
    } catch (e: any) {
      assert.strictEqual(e.name, 'AIUnavailableError');
      assert.strictEqual(e.failedProviders.length, 2);
    }
    
    assert.strictEqual(gemini.calls, 2);
    assert.strictEqual(nvidia.calls, 2);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
