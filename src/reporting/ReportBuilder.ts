/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EvidencePackage } from '../services/evidence/EvidencePackageBuilder';
import { InterpretationResult } from '../ai/contracts/InterpretationResult';
import { ProjectMetadata } from '../models/ProjectMetadata';
import { ReportModel } from './models/ReportModel';

export class ReportBuilder {
  
  public build(
    evidence: EvidencePackage,
    interpretation: InterpretationResult,
    project: ProjectMetadata,
    branding: any, // Using any for branding object imported from Branding.ts
    reportId: string = crypto.randomUUID()
  ): ReportModel {
    
    // Determine overall risk from interpretation plagiarismType and confidence
    let overallRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (interpretation.plagiarismType === 'Direct' || interpretation.plagiarismType === 'Patchwork') {
      overallRisk = interpretation.confidence > 0.8 ? 'Critical' : 'High';
    } else if (interpretation.plagiarismType === 'Paraphrased') {
      overallRisk = interpretation.confidence > 0.7 ? 'High' : 'Medium';
    } else if (interpretation.plagiarismType === 'Self') {
      overallRisk = 'Medium';
    }

    return {
      version: "1.0",
      metadata: {
        id: reportId,
        generatedAt: new Date().toISOString()
      },
      institution: {
        name: branding.institution,
        shortName: branding.shortName,
        school: branding.school,
        logo: branding.logoPng || branding.logo,
        committee: branding.committee
      },
      project: {
        projectTitle: project.projectTitle,
        department: project.department,
        programme: project.programme,
        level: project.level,
        session: project.session,
        supervisor: project.supervisor,
        submissionDate: project.submissionDate,
        students: project.students
      },
      plagiarism: {
        similarityScore: evidence.metrics.exactMatch, // Map exact match to similarity score
        matchCount: evidence.matchingFragments.length,
        wordsMatched: evidence.matchingFragments.reduce((acc, f) => acc + (f.matchedText?.split(/\s+/).length || 0), 0),
        plagiarismType: interpretation.plagiarismType,
        overallRisk
      },
      evidence: {
        candidatePaperTitle: evidence.studentDocument.title,
        candidateWordCount: evidence.studentDocument.wordCount,
        exactMatchCount: evidence.metrics.exactMatch,
        jaccardSimilarity: evidence.metrics.jaccard,
        cosineSimilarity: evidence.metrics.cosine,
        fragments: evidence.matchingFragments.map(f => f.matchedText || '')
      },
      ai: {
        confidence: interpretation.confidence,
        summary: interpretation.summary,
        evidenceExplanation: interpretation.evidenceExplanation,
        lecturerComments: interpretation.lecturerComments,
        studentFeedback: interpretation.studentFeedback,
        recommendations: interpretation.recommendations
      },
      certification: {
        aiProvider: interpretation.metadata?.provider || 'Unknown',
        model: interpretation.metadata?.model || 'Unknown',
        evidenceVersion: "1.0",
        interpretationVersion: interpretation.version,
        runtimeStatus: "Certified"
      }
    };
  }
}
