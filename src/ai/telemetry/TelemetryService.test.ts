/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { TelemetryService } from './TelemetryService';

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

  console.log('Running TelemetryService tests...\n');

  test('Calculates duration and totals correctly on success', () => {
    // Intercept console.log temporarily
    const originalLog = console.log;
    let loggedOutput = '';
    console.log = (msg: string) => { loggedOutput = msg; };

    try {
      const telemetry = new TelemetryService();
      
      const active = telemetry.startExecution('Gemini', 'gemini-2.5-flash');
      // Artificially change startTime to simulate delay
      (active as any).startTime = Date.now() - 500;
      
      const log = telemetry.completeExecution(active, 100, 50);
      
      assert.strictEqual(log.provider, 'Gemini');
      assert.strictEqual(log.model, 'gemini-2.5-flash');
      assert.ok(log.durationMs >= 500);
      assert.strictEqual(log.promptTokens, 100);
      assert.strictEqual(log.completionTokens, 50);
      assert.strictEqual(log.totalTokens, 150);
      assert.strictEqual(log.success, true);

      const parsedLog = JSON.parse(loggedOutput);
      assert.strictEqual(parsedLog.totalTokens, 150);
    } finally {
      console.log = originalLog;
    }
  });

  test('Records failure correctly without tokens', () => {
    // Intercept console.log temporarily
    const originalLog = console.log;
    let loggedOutput = '';
    console.log = (msg: string) => { loggedOutput = msg; };

    try {
      const telemetry = new TelemetryService();
      const active = telemetry.startExecution('Gemini', 'gemini-2.5-flash');
      
      const log = telemetry.failExecution(active, 'API_TIMEOUT');
      
      assert.strictEqual(log.success, false);
      assert.strictEqual(log.errorType, 'API_TIMEOUT');
      assert.strictEqual(log.totalTokens, 0);

      const parsedLog = JSON.parse(loggedOutput);
      assert.strictEqual(parsedLog.errorType, 'API_TIMEOUT');
    } finally {
      console.log = originalLog;
    }
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
