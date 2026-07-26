/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { EvidencePackageBuilder } from './EvidencePackageBuilder';
import { CandidatePaper, SimilarityEvidence } from '../../types';

function runTests() {
  const builder = new EvidencePackageBuilder();
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

  console.log('Running EvidencePackageBuilder tests...\n');

  test('Builds deterministic package', () => {
    const paper: CandidatePaper = {
      provider: 'CORE',
      providerId: '42',
      coreId: 42,
      title: 'Test Paper',
      authors: [{ name: 'Jane Doe' }],
      institutions: [],
      citationCount: 0,
      concepts: [],
      keywords: [],
      subjects: [],
      fullTextAvailable: false,
      metadata: {}
    };

    const sim: SimilarityEvidence = {
      overallSimilarity: 0.8,
      breakdown: {
        textSimilarity: 0.1,
        semanticSimilarity: 0.2,
        bibliographicOverlap: 0.3,
        citationMatch: 0.4,
        metadataSimilarity: 0.5
      },
      confidence: {
        level: 'High',
        score: 0.95
      },
      matchingPassages: [],
      provenance: {
        providers: ['CORE'],
        retrievalTimestamp: new Date().toISOString(),
        evidenceVersion: '2.1',
        similarityVersion: '2.1'
      }
    };

    const pkg = builder.build('This is a test text for the student.', 'My Essay', 5, paper, sim);

    assert.strictEqual(pkg.studentDocument.title, 'My Essay');
    assert.strictEqual(pkg.studentDocument.wordCount, 8); // 'This is a test text for the student.'
    assert.strictEqual(pkg.studentDocument.chunkCount, 5);
    assert.strictEqual(pkg.candidatePaper.coreId, 42);
    assert.strictEqual(pkg.similarity.overallSimilarity, 0.8);
    assert.strictEqual(pkg.confidence.level, 'High');
    assert.ok(pkg.generatedAt.length > 0);
  });

  console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
