/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { test, expect } from '@playwright/test';

import { ReportBuilder } from './ReportBuilder';
import { EvidencePackage } from '../services/evidence/EvidencePackageBuilder';
import { InterpretationResult } from '../ai/contracts/InterpretationResult';
import { ProjectMetadata } from '../models/ProjectMetadata';
import { Branding } from '../branding/Branding';

test.describe('ReportBuilder', () => {
  test('should map certified outputs to a ReportModel without mutating', () => {
    
    const mockEvidence: any = {
      studentDocument: { title: 'Test Doc', wordCount: 500, chunkCount: 5 },
      candidatePaper: { coreId: 1, title: 'Test Doc', authors: [] },
      similarity: {
        candidateId: 1,
        overallSimilarity: 0.85,
        matchingChunks: [{ studentChunkId: '0', candidateChunkId: '0', similarity: 0.9, matchedText: 'Test matching text' }],
        metrics: { exactMatch: 0.8, ngram: 0.85, jaccard: 0.75, cosine: 0.9 }
      },
      matchingFragments: [{ studentChunkId: '0', candidateChunkId: '0', similarity: 0.9, matchedText: 'Test matching text' }],
      metrics: { exactMatch: 0.8, ngram: 0.85, jaccard: 0.75, cosine: 0.9 },
      generatedAt: '2026-01-01T00:00:00Z'
    };

    const mockInterpretation: InterpretationResult = {
      version: '1.0',
      plagiarismType: 'Direct',
      confidence: 0.95,
      summary: 'High confidence direct plagiarism detected.',
      evidenceExplanation: ['Fragment 1 matches directly'],
      lecturerComments: '',
      studentFeedback: '',
      recommendations: ['Review citation'],
      metadata: {
        provider: 'Gemini',
        model: 'gemini-2.5-flash',
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      }
    };

    const mockProject: ProjectMetadata = {
      projectTitle: 'AI Research',
      department: 'Computer Science',
      school: 'School of Engineering',
      programme: 'HND',
      level: 'HND 2',
      session: '2025/2026',
      supervisor: 'Dr. John Doe',
      submissionDate: '2026-05-15',
      students: [{ id: '1', fullName: 'Jane Doe', matricNumber: 'CS/2026/001' }]
    };

    const builder = new ReportBuilder();
    const report = builder.build(mockEvidence, mockInterpretation, mockProject, Branding, 'test-id-123');

    // Assertions
    expect(report.metadata.id).toBe('test-id-123');
    expect(report.institution.name).toBe(Branding.institution);
    expect(report.project.projectTitle).toBe('AI Research');
    expect(report.plagiarism.plagiarismType).toBe('Direct');
    expect(report.plagiarism.overallRisk).toBe('Critical'); // High confidence direct
    expect(report.evidence.exactMatchCount).toBe(0.8);
    expect(report.evidence.fragments).toContain('Test matching text');
    expect(report.ai.confidence).toBe(0.95);
    expect(report.certification.aiProvider).toBe('Gemini');
    expect(report.certification.model).toBe('gemini-2.5-flash');
    expect(report.certification.runtimeStatus).toBe('Certified');
  });
});
