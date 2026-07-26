/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { ProviderRegistry } from './ProviderRegistry';
import { AIProvider } from '../interfaces/AIProvider';
import { InterpretationRequest } from '../contracts/InterpretationRequest';
import { InterpretationResult } from '../contracts/InterpretationResult';

class MockProvider implements AIProvider {
  constructor(public name: string) {}
  async initialize(): Promise<void> {}
  async healthCheck(): Promise<boolean> { return true; }
  async calculateSimilarity(): Promise<number> { return 0; }
  async detectAI(): Promise<number> { return 0; }
  async shutdown(): Promise<void> {}
  async analyzeDocument(request: any): Promise<any> {
    return {
      success: true,
      provider: this.name,
      model: 'mock-model',
      durationMs: 10,
      data: {
        version: '1.0',
        plagiarismType: 'None',
        confidence: 0.9,
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

  async function test(name: string, fn: () => Promise<void> | void) {
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

  console.log('Running ProviderRegistry tests...\n');

  await test('Registers and resolves primary provider by priority', async () => {
    const registry = new ProviderRegistry();
    const p1 = new MockProvider('p1');
    const p2 = new MockProvider('p2');
    
    registry.register({ id: 'p1', provider: 'Test', model: 'v1', priority: 2, enabled: true }, p1);
    registry.register({ id: 'p2', provider: 'Test', model: 'v2', priority: 1, enabled: true }, p2);

    const primary = registry.getPrimary();
    assert.strictEqual(primary?.name, 'p2');
  });

  test('Exposes fallbacks correctly', () => {
    const registry = new ProviderRegistry();
    
    registry.register(
      { id: 'gemini', provider: 'Gemini', model: 'gemini-2.5-flash', priority: 1, enabled: true },
      new MockProvider('gemini')
    );
    registry.register(
      { id: 'nvidia', provider: 'NVIDIA', model: 'llama-3.1-405b', priority: 2, enabled: true },
      new MockProvider('nvidia')
    );
    registry.register(
      { id: 'local', provider: 'Local', model: 'llama-3-8b', priority: 3, enabled: true },
      new MockProvider('local')
    );

    const fallbacks = registry.getFallbacks() as MockProvider[];
    assert.strictEqual(fallbacks.length, 2);
    assert.strictEqual(fallbacks[0].name, 'nvidia');
    assert.strictEqual(fallbacks[1].name, 'local');
  });

  await test('Filters out disabled providers', async () => {
    const registry = new ProviderRegistry();
    const p1 = new MockProvider('p1');
    
    registry.register({ id: 'p1', provider: 'Test', model: 'v1', priority: 1, enabled: false }, p1);

    const primary = registry.getPrimary();
    assert.strictEqual(primary, undefined);
    
    const providerDirect = registry.getProvider('p1');
    assert.strictEqual(providerDirect, undefined);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
