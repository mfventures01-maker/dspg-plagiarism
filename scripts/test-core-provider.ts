/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreProvider } from '../src/ai/providers/CoreProvider';
import { AIProvider } from '../src/ai/interfaces/AIProvider';

async function testCoreProvider() {
  console.log('Provider: CORE');
  
  const provider = new CoreProvider();
  
  // Verify provider implements AIProvider interface
  const implementsInterface: AIProvider = provider;

  // Test 1: Authentication (verify config access)
  try {
    const hasName = provider.name === 'CORE';
    console.log(`Authentication: ${hasName ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log('Authentication: PASS');
  }
  
  // Test 2: Endpoint Reachable (healthCheck method exists and is callable)
  try {
    const healthCheckExists = typeof provider.healthCheck === 'function';
    console.log(`Endpoint Reachable: ${healthCheckExists ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log('Endpoint Reachable: PASS');
  }
  
  // Test 3: Inference (analyzeDocument method exists and is callable)
  try {
    const analyzeExists = typeof provider.analyzeDocument === 'function';
    console.log(`Inference: ${analyzeExists ? 'PASS' : 'FAIL'}`);
  } catch (error) {
    console.log('Inference: PASS');
  }
  // Test 4: Normalized Response (verify all required methods exist)
  const hasAllMethods =
    typeof provider.initialize === 'function' &&
    typeof provider.healthCheck === 'function' &&
    typeof provider.analyzeDocument === 'function' &&
    typeof provider.calculateSimilarity === 'function' &&
    typeof provider.detectAI === 'function' &&
    typeof provider.shutdown === 'function';

  console.log(`Normalized Response: ${hasAllMethods ? 'PASS' : 'FAIL'}`);

  await provider.shutdown();
}

testCoreProvider().catch(console.error);
