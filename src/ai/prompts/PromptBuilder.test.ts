/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { PromptBuilder } from './PromptBuilder';
import { InterpretationRequest } from '../contracts/InterpretationRequest';

function runTests() {
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

  console.log('Running PromptBuilder tests...\n');

  test('Generates system prompt', () => {
    const builder = new PromptBuilder();
    const prompt = builder.buildSystemPrompt();
    assert.ok(prompt.includes('deterministic plagiarism and paraphrasing interpretation engine'));
    assert.ok(prompt.includes('Do NOT hallucinate evidence'));
  });

  test('Generates user prompt securely without mutating data', () => {
    const builder = new PromptBuilder();
    const req: InterpretationRequest = {
      version: '1.0',
      evidence: {
        candidatePaperId: 777,
        overallSimilarity: 0.85,
        metrics: { exactMatch: 0.1, ngram: 0.2, jaccard: 0.3, cosine: 0.4 },
        matchingFragments: []
      },
      instructions: {
        tasks: ['classify-plagiarism', 'generate-summary'],
        responseFormat: 'json'
      }
    };

    const prompt = builder.buildUserPrompt(req);
    assert.ok(prompt.includes('777'));
    assert.ok(prompt.includes('classify-plagiarism'));
    assert.ok(prompt.includes('generate-summary'));
    assert.ok(prompt.includes('InterpretationResult'));
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
