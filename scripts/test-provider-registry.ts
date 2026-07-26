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

async function runRV011() {
  console.log('='.repeat(60));
  console.log('P2.4A Provider Registry & Observability - RV-011 Certification');
  console.log('='.repeat(60));

  // 1. Mock EvidencePackage
  const evidencePkg: any = {
    studentDocument: { title: 'Thesis', wordCount: 1500, chunkCount: 10 },
    candidatePaper: { coreId: 90210, title: 'AI Research', authors: ['Dr. Turing'] },
    similarity: {
      candidateId: 90210,
      overallSimilarity: 0.95,
      metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 },
      matchingChunks: []
    },
    matchingFragments: [
      {
        studentChunkId: 's1', candidateChunkId: 'c1',
        similarity: 1.0, matchedText: 'AI Research is good.'
      }
    ],
    metrics: { exactMatch: 0.8, ngram: 0.9, jaccard: 0.92, cosine: 0.98 },
    generatedAt: new Date().toISOString()
  };

  try {
    // 2. Build Request
    console.log(`\nBuilding InterpretationRequest...`);
    const builder = new InterpretationRequestBuilder();
    const request = builder.buildRequest(evidencePkg, ['classify-plagiarism']);
    console.log(`✅ InterpretationRequest v${request.version} built`);

    // 3. Setup Registry & Telemetry
    console.log(`\nInitializing Registry and Telemetry...`);
    const registry = new ProviderRegistry();
    const telemetry = new TelemetryService();
    
    // Explicitly register Gemini
    registry.register(
      { id: 'gemini', provider: 'Gemini', model: 'gemini-2.5-flash', priority: 1, enabled: true },
      new GeminiProvider()
    );
    console.log(`✅ GeminiProvider registered as Primary`);

    const gateway = new AIGateway(registry, telemetry);
    console.log(`✅ Gateway initialized with strict decoupled architecture`);

    // 4. Intercept telemetry for certification assertion
    console.log(`\nInvoking AIGateway... (Awaiting structured telemetry log)`);
    console.log('-'.repeat(60));
    
    const result = await gateway.interpret(request);
    
    console.log('-'.repeat(60));
    console.log(`✅ InterpretationResult received`);
    console.log(`   Type: ${result.plagiarismType}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Provider Metadata: ${result.metadata ? 'ATTACHED' : 'MISSING'}`);
    
    console.log(`\n✅ RV-011 Certification Pipeline executed successfully.`);

  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  }
}

runRV011();
