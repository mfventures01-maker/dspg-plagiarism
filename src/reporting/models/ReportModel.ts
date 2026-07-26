/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student } from '../../models/Student';

export interface ReportMetadata {
  readonly id: string;
  readonly generatedAt: string;
}

export interface InstitutionInformation {
  readonly name: string;
  readonly shortName: string;
  readonly school: string;
  readonly logo: string;
  readonly committee: string;
}

export interface ProjectInformation {
  readonly projectTitle: string;
  readonly department: string;
  readonly programme: string;
  readonly level: string;
  readonly session: string;
  readonly supervisor: string;
  readonly submissionDate: string;
  readonly students: readonly Student[];
}

export interface PlagiarismSummary {
  readonly similarityScore: number;
  readonly matchCount: number;
  readonly wordsMatched: number;
  readonly plagiarismType: string;
  readonly overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface EvidenceSummary {
  readonly candidatePaperTitle?: string;
  readonly candidateWordCount: number;
  readonly exactMatchCount: number;
  readonly jaccardSimilarity: number;
  readonly cosineSimilarity: number;
  readonly fragments: readonly string[];
}

export interface AIInterpretationSummary {
  readonly confidence: number;
  readonly summary: string;
  readonly evidenceExplanation: readonly string[];
  readonly lecturerComments: string;
  readonly studentFeedback: string;
  readonly recommendations: readonly string[];
}

export interface CertificationSummary {
  readonly aiProvider: string;
  readonly model: string;
  readonly evidenceVersion: string;
  readonly interpretationVersion: string;
  readonly runtimeStatus: string;
}

export interface ReportModel {
  readonly version: "1.0";
  readonly metadata: ReportMetadata;
  readonly institution: InstitutionInformation;
  readonly project: ProjectInformation;
  readonly plagiarism: PlagiarismSummary;
  readonly evidence: EvidenceSummary;
  readonly ai: AIInterpretationSummary;
  readonly certification: CertificationSummary;
}
