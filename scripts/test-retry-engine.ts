/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { InterpretationRequestBuilder } from '../src/ai/builders/InterpretationRequestBuilder';
import { GeminiProvider } from '../src/ai/providers/GeminiProvider';
import { AIGateway } from '../src/ai/AIGateway';
import { ProviderRegistry } from '../src/ai/registry/ProviderRegistry';
import { TelemetryService } from '../src/ai/telemetry/TelemetryService';
import { EvidencePackage } from '../src/services/evidence/EvidencePackageBuilder';
import { AIProviderError } from '../src/ai/errors/AIProviderError';

// Quick hack for the test: Override the global fetch temporarily to simulate a RATE_LIMIT failure on the first try
const originalFetch = global.fetch;
let attempts = 0;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  attempts++;
  if (attempts === 1) {
    // Simulate Gemini 429
    return new Response('Rate limit exceeded', { status: 429, statusText: 'Too Many Requests' });
  }
  // Proceed normally
  return originalFetch(input, init);
};

async function runRV012() {
  console.log('='.repeat(60));
  console.log('P2.4B Deterministic Retry Engine - RV-012 Certification');
  console.log('='.repeat(60));

  const evidencePkg: any = {
    studentDocument: { title: 'Thesis', wordCount: 1500, chunkCount: 10 },
    candidatePaper: { coreId: 8080, title: 'Retry Test', authors: [] },
    similarity: {
      candidateId: 8080, overallSimilarity: 0.95,
      metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 },
      matchingChunks: []
    },
    matchingFragments: [
      { studentChunkId: 's1', candidateChunkId: 'c1', similarity: 1.0, matchedText: 'match' }
    ],
    metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 },
    generatedAt: new Date().toISOString()
  };

  try {
    const builder = new InterpretationRequestBuilder();
    const request = builder.buildRequest(evidencePkg, ['classify-plagiarism']);
    
    console.log(`\nInitializing Registry, Telemetry, and Gateway (with fast 100ms retry policy)...`);
    const registry = new ProviderRegistry();
    const telemetry = new TelemetryService();
    registry.register(
      { id: 'gemini', provider: 'Gemini', model: 'gemini-2.5-flash', priority: 1, enabled: true },
      new GeminiProvider()
    );
    
    const gateway = new AIGateway(registry, telemetry, {
      maxAttempts: 3,
      initialDelayMs: 100,
      exponentialBackoff: true,
      multiplier: 2,
      retryableErrors: ['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR', 'NETWORK_ERROR']
    });

    console.log(`✅ Architecture setup complete`);

    console.log(`\nInvoking AIGateway (first call will artificially simulate a 429)...`);
    console.log('-'.repeat(60));
    
    const result = await gateway.interpret(request);
    
    console.log('-'.repeat(60));
    console.log(`✅ InterpretationResult received after retries`);
    console.log(`   Type: ${result.plagiarismType}`);
    
    // We expect 2 attempts at the fetch level
    if (attempts !== 2) {
      throw new Error(`Expected exactly 2 fetch attempts (1 fail, 1 success), got ${attempts}`);
    }
    
    console.log(`\n✅ RV-012 Certification Pipeline executed successfully. Expected backoff occurred.`);

  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  } finally {
    global.fetch = originalFetch; // Restore just in case
  }
}

runRV012();
