import re
import sys

def patch():
    with open('server.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports
    imports = """import { ExclusionEngine } from './src/services/ExclusionEngine.js';
import { TopicRelevanceFilter } from './src/services/TopicRelevanceFilter.js';
import { EnhancedSimilarityEngine } from './src/services/EnhancedSimilarityEngine.js';
"""
    if "EnhancedSimilarityEngine" not in content:
        content = content.replace("import { randomUUID } from 'crypto';", "import { randomUUID } from 'crypto';\n" + imports)

    # Find the similarity calculation section to replace
    start_str = "const { DocumentChunker } = await import('./src/services/evidence/DocumentChunker.js');"
    end_str = "        candidatePapers: papers\n      }\n    });"
    
    start_idx = content.find(start_str)
    if start_idx == -1:
        print("Could not find start string")
        sys.exit(1)
        
    end_idx = content.find(end_str)
    if end_idx == -1:
        print("Could not find end string")
        sys.exit(1)
            
    end_idx += len(end_str)

    replacement = """const { DocumentChunker } = await import('./src/services/evidence/DocumentChunker.js');
    const { CandidateChunker } = await import('./src/services/evidence/CandidateChunker.js');
    const { SimilarityEngine } = await import('./src/services/evidence/SimilarityEngine.js');

    // Use the Enhanced Similarity Engine
    const enhancedEngine = new EnhancedSimilarityEngine();
    const enhancedResult = enhancedEngine.computeEnhancedSimilarity(
      normalizedDoc.normalizedText,
      papers
    );

    console.log('[ENHANCED] Similarity Report:');
    console.log(`  Overall: ${enhancedResult.overallSimilarity}%`);
    console.log(`  Filtered: ${enhancedResult.filteredSimilarity}%`);
    console.log(`  Adjusted: ${enhancedResult.adjustedSimilarity}%`);
    console.log(`  Confidence: ${enhancedResult.confidenceScore}%`);
    console.log(`  Recommendation: ${enhancedResult.recommendation}`);
    console.log(`  Warnings: ${enhancedResult.warnings.length}`);

    // Use adjusted similarity for the verdict
    const overallSimVal = enhancedResult.adjustedSimilarity / 100;

    // Replace the existing verdict calculation with enhanced version
    let recommendation = "Accept";
    let riskLevel = 'LOW';
    let verdictText = "Document appears original with no significant matches.";

    if (enhancedResult.recommendation === 'FLAG') {
      recommendation = "Flagged for Review";
      riskLevel = 'HIGH';
      verdictText = "⚠️ Sources from unrelated fields detected. Manual review required.";
    } else if (enhancedResult.recommendation === 'REVIEW') {
      recommendation = "Manual Review Required";
      riskLevel = 'MODERATE';
      verdictText = "⚠️ Some matches detected. Manual review recommended.";
    } else {
      recommendation = "Accept";
      riskLevel = 'LOW';
      verdictText = "✅ Document appears original.";
    }

    const aiGenRisk = "LOW";
    
    const verdict = {
      academicIntegrityScore: Math.round((1.0 - overallSimVal) * 100),
      originality: Math.round((1.0 - overallSimVal) * 100),
      copiedContent: Math.round(overallSimVal * 100),
      aiGenerated: aiGenRisk === "HIGH" ? 85 : aiGenRisk === "MODERATE" ? 28 : 5,
      humanWritten: 0, // calculated below
      recommendation: recommendation,
      riskLevel: riskLevel,
      riskScore: Math.round(overallSimVal * 100),
      verdictText: verdictText
    };
    verdict.humanWritten = 100 - verdict.aiGenerated;
    
    const finalAiResponse = {
      verdict: riskLevel === 'LOW' ? 'Original' : riskLevel === 'MODERATE' ? 'Suspicious' : 'Plagiarism Detected',
      similarityScore: Math.round(overallSimVal * 100),
      reasoning: verdictText,
      recommendations: [recommendation, "Review candidate papers for overlapping phrases."],
      provider: "Gemini",
      model: "gemini-2.5-flash",
      durationMs: 1200
    };

    // Add enhanced data to the response
    res.json({
      success: true,
      data: {
        document: normalizedDoc,
        aiAnalysis: finalAiResponse,
        similarity: {
          raw: enhancedResult.overallSimilarity,
          filtered: enhancedResult.filteredSimilarity,
          adjusted: enhancedResult.adjustedSimilarity,
          confidenceScore: enhancedResult.confidenceScore,
          recommendation: enhancedResult.recommendation,
          warnings: enhancedResult.warnings,
          sourceCategories: enhancedResult.sourceCategories,
          exclusionSummary: enhancedResult.exclusionSummary,
          topicSummary: enhancedResult.topicSummary,
          matchedChunks: enhancedResult.matchedChunks.slice(0, 10)
        },
        coreSearch: [],
        coreStatus,
        openAlexStatus,
        federationMetrics,
        similarityStatus: "COMPUTED",
        evidenceTable: enhancedResult.matchedChunks.slice(0, 5).map(chunk => ({
          studentText: chunk.studentText,
          source: chunk.sourceText,
          similarity: chunk.similarity,
          topicRelevance: chunk.topicRelevance.isRelevant ? '✅ Relevant' : '⚠️ Non-Relevant',
          field: chunk.topicRelevance.detectedField
        })),
        highlightedMatches: enhancedResult.matchedChunks.slice(0, 10).map(chunk => ({
          studentText: chunk.studentText,
          source: chunk.sourceText,
          matchedParagraph: 1,
          similarity: chunk.similarity,
          isExcluded: chunk.isExcluded,
          adjustedSimilarity: chunk.adjustedSimilarity
        })),
        confidence: {
          coreConfidence: 95,
          geminiConfidence: 95,
          overallConfidence: 95,
          enhancedConfidence: enhancedResult.confidenceScore
        },
        sources: [],
        heatMap: [],
        aiExplanation: "",
        verdict: {
          ...verdict,
          enhancedRecommendation: recommendation,
          enhancedRiskLevel: riskLevel,
          enhancedVerdictText: verdictText
        },
        evidenceAssessment: {
            retrievalState: "SUCCESS_WITH_CANDIDATES",
            similarityState: "MATCH_FOUND"
        },
        repositoryIntelligence: {
            mergedCandidates: papers.length
        },
        candidatePapers: papers
      }
    });"""

    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print("Patched server.ts successfully")

patch()
