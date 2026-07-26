/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { CandidatePaperProvider } from '../src/services/evidence/CandidatePaperProvider';
import { DocumentChunker } from '../src/services/evidence/DocumentChunker';
import { CandidateChunker } from '../src/services/evidence/CandidateChunker';
import { SimilarityEngine } from '../src/services/evidence/SimilarityEngine';
import { EvidencePackageBuilder } from '../src/services/evidence/EvidencePackageBuilder';

async function runEngine() {
  console.log('='.repeat(60));
  console.log('P2.2A Candidate Evidence Engine - Runtime Certification');
  console.log('='.repeat(60));

  const text = 'Machine learning is a subset of artificial intelligence that involves the development of algorithms and statistical models that enable computers to improve their performance on a specific task through experience.';
  const title = 'Introduction to ML';

  try {
    const provider = new CandidatePaperProvider();
    const docChunker = new DocumentChunker();
    const candChunker = new CandidateChunker();
    const simEngine = new SimilarityEngine();
    const pkgBuilder = new EvidencePackageBuilder();

    // 1. Chunk student document
    const studentChunks = docChunker.chunk('student_doc_1', text);
    console.log(`✅ Student chunks created: ${studentChunks.length}`);

    // 2. Retrieve candidates
    console.log(`\nRetrieving candidate papers for query...`);
    const papers = await provider.getCandidates(text);
    console.log(`✅ Candidate papers retrieved: ${papers.length}`);

    if (papers.length === 0) {
      console.log('No papers found, aborting test.');
      process.exit(0);
    }

    // Process the top paper
    const paper = papers[0];
    console.log(`   Top paper: ${paper.title}`);

    // 3. Chunk candidate paper
    const candidateChunks = candChunker.chunk(paper);
    console.log(`✅ Candidate chunks created: ${candidateChunks.length}`);

    // 4. Similarity
    const similarity = simEngine.computeSimilarity(paper, studentChunks, candidateChunks);
    console.log(`✅ Similarity computed: ${similarity.overallSimilarity.toFixed(4)}`);
    console.log(`   Metrics: textSimilarity=${similarity.breakdown.textSimilarity.toFixed(2)}, semanticSimilarity=${similarity.breakdown.semanticSimilarity.toFixed(2)}`);
    console.log(`✅ Matching fragments generated: ${similarity.matchingPassages.length}`);

    // 5. Evidence Package
    const evidencePkg = pkgBuilder.build(text, title, studentChunks.length, paper, similarity);
    console.log(`✅ EvidencePackage produced`);
    console.log(`✅ Metrics populated`);
    console.log(`\nEvidence Package output preview:\n`);
    console.log(JSON.stringify(evidencePkg, null, 2).substring(0, 500) + '\n...\n}');

  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  }
}

runEngine();
