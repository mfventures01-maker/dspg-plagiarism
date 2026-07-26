/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { test, expect } from '@playwright/test';

import { HTMLRenderer } from './HTMLRenderer';
import { ReportModel } from '../models/ReportModel';

test.describe('HTMLRenderer', () => {
  test('should render a semantic HTML report string', () => {
    
    const mockReport: ReportModel = {
      version: '1.0',
      metadata: { id: 'test-id-123', generatedAt: '2026-01-01T12:00:00Z' },
      institution: {
        name: 'Delta State Polytechnic Ogwashi-Uku',
        shortName: 'DSPG',
        school: 'School of Engineering',
        logo: 'logo.png',
        committee: 'HND Projects Committee'
      },
      project: {
        projectTitle: 'AI Research',
        department: 'Computer Science',
        programme: 'HND',
        level: 'HND 2',
        session: '2025/2026',
        supervisor: 'Dr. John Doe',
        submissionDate: '2026-05-15',
        students: [{ id: '1', fullName: 'Jane Doe', matricNumber: 'CS/2026/001' }]
      },
      plagiarism: {
        similarityScore: 0.8,
        matchCount: 1,
        wordsMatched: 50,
        plagiarismType: 'Direct',
        overallRisk: 'Critical'
      },
      evidence: {
        candidatePaperTitle: 'Test Doc',
        candidateWordCount: 500,
        exactMatchCount: 0.8,
        jaccardSimilarity: 0.75,
        cosineSimilarity: 0.9,
        fragments: ['Test matching text']
      },
      ai: {
        confidence: 0.95,
        summary: 'High confidence direct plagiarism detected.',
        evidenceExplanation: ['Fragment 1 matches directly'],
        lecturerComments: '',
        studentFeedback: '',
        recommendations: ['Review citation']
      },
      certification: {
        aiProvider: 'Gemini',
        model: 'gemini-2.5-flash',
        evidenceVersion: '1.0',
        interpretationVersion: '1.0',
        runtimeStatus: 'Certified'
      }
    };

    const renderer = new HTMLRenderer();
    const html = renderer.render(mockReport);

    // Basic structural checks
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Plagiarism Report - AI Research</title>');
    
    // Content checks
    expect(html).toContain('Delta State Polytechnic Ogwashi-Uku');
    expect(html).toContain('test-id-123');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('CS/2026/001');
    expect(html).toContain('Critical');
    expect(html).toContain('80.0%');
    expect(html).toContain('Gemini (gemini-2.5-flash)');
    expect(html).toContain('Certified');
    
    // Ensure no AI logic or HTTP calls are visible in output
    expect(html).not.toContain('fetch(');
  });
});
