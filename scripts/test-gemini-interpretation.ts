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

async function runInterpretation() {
  console.log('='.repeat(60));
  console.log('P2.3 Gemini Interpretation Architecture - Runtime Certification');
  console.log('='.repeat(60));

  // 1. We mock an EvidencePackage since we are not testing the Evidence Engine here.
  // The Evidence Engine is strictly deterministic and certified in P2.2A.
  const evidencePkg: any = {
    studentDocument: {
      title: 'My Thesis on AI',
      wordCount: 1500,
      chunkCount: 10
    },
    candidatePaper: {
      coreId: 102030,
      title: 'The basics of AI',
      authors: ['Alan Turing'],
      abstract: 'AI is a field of computer science.'
    },
    similarity: {
      candidateId: 102030,
      overallSimilarity: 0.95,
      metrics: {
        exactMatch: 0.8,
        ngram: 0.9,
        jaccard: 0.92,
        cosine: 0.98
      },
      matchingChunks: []
    },
    matchingFragments: [
      {
        studentChunkId: 's_01',
        candidateChunkId: 'c_01',
        similarity: 1.0,
        matchedText: 'AI is a field of computer science.'
      }
    ],
    metrics: {
      exactMatch: 0.8,
      ngram: 0.9,
      jaccard: 0.92,
      cosine: 0.98
    },
    generatedAt: new Date().toISOString()
  };

  try {
    // 2. Build Request
    console.log(`\nBuilding InterpretationRequest...`);
    const builder = new InterpretationRequestBuilder();
    const request = builder.buildRequest(evidencePkg, ['classify-plagiarism', 'generate-summary']);
    console.log(`✅ InterpretationRequest v${request.version} built`);
    console.log(`   Tasks: ${request.instructions.tasks.join(', ')}`);
    console.log(`   Candidate ID inside Evidence: ${request.evidence.candidatePaperId}`);

    // 3. Setup Gateway
    console.log(`\nInitializing AIGateway with Registry and Telemetry...`);
    const registry = new ProviderRegistry();
    const telemetry = new TelemetryService();
    registry.register(
      { id: 'gemini', provider: 'Gemini', model: 'gemini-2.5-flash', priority: 1, enabled: true },
      new GeminiProvider()
    );
    const gateway = new AIGateway(registry, telemetry);
    console.log(`✅ Gateway initialized`);

    // 4. Execute AI
    console.log(`\nInvoking Gemini for Interpretation (this may take a few seconds)...`);
    const result = await gateway.interpret(request);
    
    console.log(`✅ InterpretationResult received and validated`);
    console.log(`   Version: ${result.version}`);
    console.log(`   Type: ${result.plagiarismType}`);
    console.log(`   Confidence: ${result.confidence}`);
    console.log(`   Summary: ${result.summary}`);
    
    console.log(`\nPipeline executed successfully.`);

  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  }
}

runInterpretation();
