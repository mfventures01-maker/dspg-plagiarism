/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { AIGateway } from './AIGateway';
import { AIProvider } from './interfaces/AIProvider';
import { InterpretationRequest } from './contracts/InterpretationRequest';
import { InterpretationResult } from './contracts/InterpretationResult';
import { ProviderRegistry } from './registry/ProviderRegistry';
import { TelemetryService } from './telemetry/TelemetryService';
import { AIProviderError } from './errors/AIProviderError';
import { RateLimitError } from './errors/AIErrors';

class MockProvider implements AIProvider {
  public name: string;
  public calls = 0;
  private readonly failType?: string;

  constructor(name: string, failType?: string) {
    this.name = name;
    this.failType = failType;
  }

  async initialize(): Promise<void> {}
  async healthCheck(): Promise<boolean> { return true; }
  async calculateSimilarity(): Promise<number> { return 0; }
  async detectAI(): Promise<number> { return 0; }
  async shutdown(): Promise<void> {}

  public async analyzeDocument(request: any): Promise<any> {
    this.calls++;
    if (this.failType === 'RETRYABLE') {
      throw new RateLimitError(this.name, 'Rate limit');
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
        summary: 'Mock success',
        evidenceExplanation: [],
        lecturerComments: '',
        studentFeedback: '',
        recommendations: []
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

  console.log('Running AIGateway tests...\n');

  await test('Gateway invokes provider correctly with failover and telemetry', async () => {
    const registry = new ProviderRegistry();
    const primary = new MockProvider('mock-primary', 'RETRYABLE'); // will fail over
    const fallback = new MockProvider('mock-fallback'); // will succeed
    
    registry.register({ id: 'mock-primary', provider: 'MockPrimary', model: 'v1', priority: 1, enabled: true }, primary);
    registry.register({ id: 'mock-fallback', provider: 'MockFallback', model: 'v2', priority: 2, enabled: true }, fallback);
    
    const telemetry = new TelemetryService();
    // Fast retry, only 1 max attempt so it fails over immediately
    const gateway = new AIGateway(registry, telemetry, {
      maxAttempts: 1, initialDelayMs: 10, exponentialBackoff: false, multiplier: 1, retryableErrors: ['RATE_LIMIT']
    });
    
    const req = { version: '1.0' } as InterpretationRequest;
    
    // Intercept console.log for telemetry
    const originalLog = console.log;
    let loggedOutput = '';
    console.log = (msg: string) => { 
      if (msg.includes('executionId')) loggedOutput = msg; 
    };

    let res: InterpretationResult;
    try {
      res = await gateway.interpret(req);
    } finally {
      console.log = originalLog;
    }
    
    assert.strictEqual(res.plagiarismType, 'Direct');
    assert.strictEqual(res.confidence, 0.99);
    
    const parsedLog = JSON.parse(loggedOutput);
    assert.strictEqual(parsedLog.success, true);
    assert.strictEqual(parsedLog.provider, 'mock-fallback');
    assert.strictEqual(parsedLog.fallbackActivated, true);
    assert.strictEqual(parsedLog.failedProviders[0], 'mock-primary');
    assert.strictEqual(primary.calls, 1);
    assert.strictEqual(fallback.calls, 1);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
