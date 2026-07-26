/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { InterpretationRequestBuilder } from '../src/ai/builders/InterpretationRequestBuilder';
import { GeminiProvider } from '../src/ai/providers/GeminiProvider';
import { NVIDIAProvider } from '../src/ai/providers/NVIDIAProvider';
import { AIGateway } from '../src/ai/AIGateway';
import { ProviderRegistry } from '../src/ai/registry/ProviderRegistry';
import { TelemetryService } from '../src/ai/telemetry/TelemetryService';
import { EvidencePackage } from '../src/services/evidence/EvidencePackageBuilder';

const originalFetch = global.fetch;
let attempts = 0;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  attempts++;
  const url = input.toString();

  // Fail Gemini entirely (500)
  if (url.includes('generativelanguage')) {
    return new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
  }

  // Succeed NVIDIA
  if (url.includes('nvidia')) {
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"version":"1.0","plagiarismType":"Direct","confidence":0.99}' } }],
      usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
    }), { status: 200, statusText: 'OK' });
  }

  return originalFetch(input, init);
};

async function runRV013() {
  console.log('='.repeat(60));
  console.log('P2.4C Provider Failover Engine - RV-013 Certification');
  console.log('='.repeat(60));

  const evidencePkg: any = {
    studentDocument: { title: 'Thesis', wordCount: 1500, chunkCount: 10 },
    candidatePaper: { coreId: 8080, title: 'Failover Test', authors: [] },
    similarity: { candidateId: 8080, overallSimilarity: 0.95, metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 }, matchingChunks: [] },
    matchingFragments: [{ studentChunkId: 's1', candidateChunkId: 'c1', similarity: 1.0, matchedText: 'match' }],
    metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 },
    generatedAt: new Date().toISOString()
  };

  try {
    const request = new InterpretationRequestBuilder().buildRequest(evidencePkg, ['classify-plagiarism']);
    
    console.log(`\nInitializing Registry...`);
    const registry = new ProviderRegistry();
    const telemetry = new TelemetryService();
    registry.register({ id: 'gemini', provider: 'Gemini', model: 'gemini-2.5-flash', priority: 1, enabled: true }, new GeminiProvider());
    // Using a fake API key for NVIDIA since we mocked the network anyway
    registry.register({ id: 'nvidia', provider: 'NVIDIA', model: 'llama-3.1-405b', priority: 2, enabled: true }, new NVIDIAProvider());
    
    const gateway = new AIGateway(registry, telemetry, {
      maxAttempts: 2, // 2 attempts per provider
      initialDelayMs: 10,
      exponentialBackoff: false,
      multiplier: 1,
      retryableErrors: ['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR', 'NETWORK_ERROR']
    });

    console.log(`✅ Providers configured: Primary [Gemini], Fallback [NVIDIA]`);

    console.log(`\nInvoking AIGateway (Gemini mocked to 500, NVIDIA mocked to 200)...`);
    console.log('-'.repeat(60));
    
    const result = await gateway.interpret(request);
    
    console.log('-'.repeat(60));
    console.log(`✅ InterpretationResult received from fallback provider`);
    console.log(`   Type: ${result.plagiarismType}`);
    
    // We expect 2 attempts for Gemini, 1 for NVIDIA = 3 fetch calls
    if (attempts !== 3) {
      throw new Error(`Expected exactly 3 fetch attempts (2 fail gemini, 1 succeed nvidia), got ${attempts}`);
    }
    
    console.log(`\n✅ RV-013 Certification Pipeline executed successfully. Expected failover occurred.`);

  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  } finally {
    global.fetch = originalFetch; 
  }
}

runRV013();
