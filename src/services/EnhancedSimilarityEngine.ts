// src/services/EnhancedSimilarityEngine.ts
// HOEOS: Enhanced Similarity Engine with Exclusion & Topic Filtering

import { ExclusionEngine } from './ExclusionEngine.js';
import { TopicRelevanceFilter } from './TopicRelevanceFilter.js';

export interface MatchedChunk {
  studentText: string;
  sourceText: string;
  similarity: number;
  isExcluded: boolean;
  excludedRules: string[];
  topicRelevance: {
    score: number;
    isRelevant: boolean;
    detectedField: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    matchedKeywords: string[];
  };
  adjustedSimilarity: number;
}

export interface SourceCategories {
  engineering: number;
  agriculture: number;
  medical: number;
  humanities: number;
  physical_sciences: number;
  unknown: number;
}

export interface EnhancedSimilarityResult {
  overallSimilarity: number;
  filteredSimilarity: number;
  adjustedSimilarity: number;
  matchedChunks: MatchedChunk[];
  sourceCategories: SourceCategories;
  recommendation: 'PASS' | 'REVIEW' | 'FLAG';
  warnings: string[];
  exclusionSummary: {
    totalExcluded: number;
    excludedRules: string[];
  };
  topicSummary: {
    dominantField: string;
    confidence: number;
  };
  confidenceScore: number;
}

export class EnhancedSimilarityEngine {
  private exclusionEngine: ExclusionEngine;

  constructor() {
    this.exclusionEngine = ExclusionEngine.getInstance();
  }

  computeEnhancedSimilarity(studentText: string, candidatePapers: any[]): EnhancedSimilarityResult {
    const matchedChunks: MatchedChunk[] = [];
    const sourceCategories: SourceCategories = {
      engineering: 0,
      agriculture: 0,
      medical: 0,
      humanities: 0,
      physical_sciences: 0,
      unknown: 0
    };
    const warnings: string[] = [];
    const excludedRules: string[] = [];
    
    let totalSimilarity = 0;
    let filteredSimilarity = 0;
    let adjustedSimilarity = 0;
    let totalExcluded = 0;
    let relevantMatches = 0;
    let fieldConfidenceSum = 0;
    let fieldCount = 0;

    // Process each candidate paper
    for (const paper of candidatePapers) {
      // Analyze topic relevance
      const topicAnalysis = TopicRelevanceFilter.analyzeTopic(
        studentText,
        paper.title || '',
        paper.abstract || ''
      );

      // Categorize the source
      const fieldKey = topicAnalysis.field as keyof SourceCategories;
      if (fieldKey in sourceCategories) {
        sourceCategories[fieldKey] = (sourceCategories[fieldKey] || 0) + 1;
      } else {
        sourceCategories.unknown = (sourceCategories.unknown || 0) + 1;
      }

      // Check if the student text contains boilerplate
      const exclusionCheck = this.exclusionEngine.isExcluded(studentText);

      // Calculate raw similarity
      const similarity = this.calculateSimilarity(studentText, paper);
      
      // Calculate adjusted similarity based on exclusions and relevance
      let adjusted = similarity;
      
      if (exclusionCheck.excluded) {
        adjusted *= 0.1; // Drastically reduce weight for boilerplate
        totalExcluded++;
        excludedRules.push(...exclusionCheck.matchedRules);
        warnings.push(`📝 Excluded boilerplate: "${studentText.substring(0, 60)}..."`);
      } else if (!topicAnalysis.isRelevant) {
        adjusted *= 0.2; // Reduce weight for irrelevant sources
        warnings.push(`⚠️ Topic mismatch: Engineering text vs ${topicAnalysis.field} source`);
      } else if (topicAnalysis.confidence === 'HIGH') {
        adjusted *= 1.0; // Full weight for highly relevant sources
        relevantMatches++;
      } else if (topicAnalysis.confidence === 'MEDIUM') {
        adjusted *= 0.7; // Partial weight for medium confidence
        relevantMatches++;
      } else {
        adjusted *= 0.4; // Low weight for low confidence matches
      }

      // Track confidence
      if (topicAnalysis.field !== 'unknown') {
        fieldConfidenceSum += topicAnalysis.score;
        fieldCount++;
      }

      matchedChunks.push({
        studentText: studentText.substring(0, 150),
        sourceText: paper.title || 'Unknown source',
        similarity: Math.round(similarity * 100),
        isExcluded: exclusionCheck.excluded,
        excludedRules: exclusionCheck.matchedRules,
        topicRelevance: {
          score: topicAnalysis.score,
          isRelevant: topicAnalysis.isRelevant,
          detectedField: topicAnalysis.field,
          confidence: topicAnalysis.confidence,
          matchedKeywords: topicAnalysis.matchedKeywords
        },
        adjustedSimilarity: Math.round(adjusted * 100)
      });

      totalSimilarity += similarity;
      filteredSimilarity += exclusionCheck.excluded ? 0 : similarity;
      adjustedSimilarity += adjusted;
    }

    const totalSources = candidatePapers.length || 1;
    const finalSimilarity = Math.round((totalSimilarity / totalSources) * 100);
    const finalFiltered = Math.round((filteredSimilarity / totalSources) * 100);
    const finalAdjusted = Math.round((adjustedSimilarity / totalSources) * 100);

    // Determine dominant field
    let dominantField = 'unknown';
    let maxCount = 0;
    for (const [field, count] of Object.entries(sourceCategories)) {
      if (count > maxCount) {
        maxCount = count;
        dominantField = field;
      }
    }

    // Determine confidence score
    const avgFieldConfidence = fieldCount > 0 ? Math.round(fieldConfidenceSum / fieldCount) : 0;
    const confidenceScore = Math.min(
      100,
      Math.max(0, 
        (avgFieldConfidence * 0.6) + 
        (finalAdjusted > 0 ? 30 : 0) + 
        (relevantMatches > 0 ? 10 : 0)
      )
    );

    // Recommendation logic
    let recommendation: 'PASS' | 'REVIEW' | 'FLAG' = 'PASS';
    const isAgriculture = sourceCategories.agriculture > sourceCategories.engineering;

    if (isAgriculture && sourceCategories.agriculture > 2) {
      recommendation = 'FLAG';
      warnings.push('🚨 Multiple matches from agriculture sources - likely topic mismatch!');
    } else if (finalAdjusted > 25) {
      recommendation = 'REVIEW';
      warnings.push(`⚠️ Adjusted similarity above 25% (${finalAdjusted}%) - manual review recommended`);
    } else if (finalAdjusted > 15 && confidenceScore < 50) {
      recommendation = 'REVIEW';
      warnings.push(`⚠️ Moderate similarity (${finalAdjusted}%) with low confidence - review recommended`);
    } else if (warnings.length > 2) {
      recommendation = 'REVIEW';
    }

    return {
      overallSimilarity: finalSimilarity,
      filteredSimilarity: finalFiltered,
      adjustedSimilarity: finalAdjusted,
      matchedChunks,
      sourceCategories,
      recommendation,
      warnings,
      exclusionSummary: {
        totalExcluded,
        excludedRules: [...new Set(excludedRules)]
      },
      topicSummary: {
        dominantField,
        confidence: avgFieldConfidence
      },
      confidenceScore
    };
  }

  private calculateSimilarity(studentText: string, paper: any): number {
    // Enhanced similarity calculation with more sophisticated methods
    const cleanText = studentText.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    const cleanTitle = (paper.title || '').toLowerCase().replace(/[^a-z\s]/g, '').trim();
    
    const words = cleanText.split(/\s+/);
    const sourceWords = cleanTitle.split(/\s+/);
    
    // Check for meaningful overlap (exclude common stopwords)
    const stopwords = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'to', 'in', 'on', 'at', 'with', 'by', 'from', 'up', 'into', 'through', 'during', 'without']);
    const meaningfulWords = words.filter(w => w.length > 3 && !stopwords.has(w));
    const meaningfulSource = sourceWords.filter(w => w.length > 3 && !stopwords.has(w));
    
    if (meaningfulWords.length === 0 || meaningfulSource.length === 0) return 0;
    
    const common = meaningfulWords.filter(w => meaningfulSource.includes(w));
    const totalUnique = new Set([...meaningfulWords, ...meaningfulSource]).size;
    
    // Jaccard similarity
    return totalUnique > 0 ? (common.length / totalUnique) : 0;
  }
}
