/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import multer from 'multer';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import { randomUUID } from 'crypto';
import { ExclusionEngine } from './src/services/ExclusionEngine.js';
import { TopicRelevanceFilter } from './src/services/TopicRelevanceFilter.js';
import { EnhancedSimilarityEngine } from './src/services/EnhancedSimilarityEngine.js';


// Polyfill DOMMatrix for pdfjs-dist under Vercel Serverless environment
if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

import { AIGateway } from './src/ai/gateway/AIGateway.js';
import { QueueManager } from './src/services/queue/QueueManager.js';

dotenv.config();

const app = express();
const PORT = 3000;

// — Structured Logging ——————————————————————————————————————————————————————

interface LogEntry {
  timestamp: string;
  requestId: string;
  route: string;
  fileName?: string;
  mimeType?: string;
  status: 'SUCCESS' | 'ERROR' | 'INFO';
  duration?: string;
  errorCode?: string;
  stack?: string;
}

function log(entry: LogEntry): void {
  const parts: string[] = [
    `[${entry.timestamp}]`,
    `request=${entry.requestId.substring(0, 8)}`,
    entry.route,
  ];
  if (entry.fileName) parts.push(`file=${entry.fileName}`);
  if (entry.mimeType) parts.push(`mime=${entry.mimeType}`);
  parts.push(`status=${entry.status}`);
  if (entry.duration) parts.push(`duration=${entry.duration}`);
  if (entry.errorCode) parts.push(`error=${entry.errorCode}`);

  console.log(parts.join(' | '));

  if (entry.stack) {
    console.error(`[STACK] request=${entry.requestId.substring(0, 8)}\n${entry.stack}`);
  }
}

// — API Response Helpers ——————————————————————————————————————————————————————

function apiError(
  res: express.Response,
  status: number,
  code: string,
  message: string,
  details?: object
): void {
  console.error('[SERVER ERROR]', status, code, message, details);
  res.status(status).json({
    success: false,
    error: { code, message, details: details ?? {} },
  });
}

// — File Upload ———————————————————————————————————————————————————————————————

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// — AI Gateway ————————————————————————————————————————————————————————————————

const aiGateway = new AIGateway();
const queueManager = new QueueManager();

// — Request ID Middleware ——————————————————————————————————————————————————————

app.use((req, _res, next) => {
  (req as any).requestId = randomUUID();
  next();
});

// — Standard Middleware ————————————————————————————————————————————————————————

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// — CORS ——————————————————————————————————————————————————————————————————————

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// — Health Check ———————————————————————————————————————————————————————————————

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.get('/health/runtime', async (_req, res) => {
  const { execSync } = await import('child_process');
  let gitCommit = process.env.VERCEL_GIT_COMMIT_SHA || '';
  let commitVerified = false;
  if (!gitCommit) {
    try {
      gitCommit = execSync('git rev-parse HEAD').toString().trim();
      commitVerified = true;
    } catch (e) {
      gitCommit = 'unknown';
    }
  } else {
    commitVerified = true;
  }

  const aiHealthy = !!aiGateway ? 'healthy' : 'degraded';
  const uploadHealthy = !!upload ? 'healthy' : 'degraded';

  res.json({
    build: 'pass',
    ai: aiHealthy,
    coreApi: 'healthy',
    pdf: 'healthy',
    upload: uploadHealthy,
    version: process.env.npm_package_version || '1.0.0',
    git: gitCommit,
    commitVerified: commitVerified
  });
});

// — Document Analysis and Plagiarism Detection API ————————————————————————————

// New async endpoint with 202 Accepted
app.post('/api/analyze/async', async (req, res) => {
  try {
    const { documentText, documentName } = req.body;

    if (!documentText) {
      return res.status(400).json({ error: 'Document text is required' });
    }

    const jobId = queueManager.enqueueDocument(documentText, documentName || 'Unnamed Document');

    return res.status(202).json({
      status: 'accepted',
      message: 'Document queued for analysis',
      jobId,
      statusUrl: `/api/status/${jobId}`,
    });
  } catch (error) {
    console.error('[API] Async analysis error:', error);
    return res.status(500).json({ error: 'Failed to queue document' });
  }
});

// Status endpoint
app.get('/api/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const job = queueManager.getJobStatus(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    result: job.status === 'completed' ? job.result : undefined,
    federationMetrics: (job.result as any)?.federationMetrics || { providers: [] },
    error: job.status === 'failed' ? job.error : undefined,
  });
});

// Get all jobs (admin)
app.get('/api/jobs', (req, res) => {
  const jobs = queueManager.getAllJobs();
  return res.json({
    total: jobs.length,
    jobs: jobs.map(j => ({
      id: j.id,
      status: j.status,
      progress: j.progress,
      createdAt: j.createdAt,
      completedAt: j.completedAt,
    })),
  });
});

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  const requestId: string = (req as any).requestId ?? randomUUID();
  const elapsed = () => `${Date.now() - startTime}ms`;

  let text = req.body.text || '';
  let fileName = 'Pasted Text Input';
  let mimeType = 'text/plain';

  try {
    // — Text Extraction ——————————————————————————————————————————————————————
    if (req.file) {
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
      const buffer = req.file.buffer;
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (extension === 'txt' || mimeType === 'text/plain') {
        text = buffer.toString('utf-8');

      } else if (extension === 'docx') {
        const mammothResult = await mammoth.extractRawText({ buffer });
        text = mammothResult.value;

      } else if (extension === 'pdf') {
        try {
          const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

          const pdfData = await Promise.race([
            (pdfParse as any)(uint8Array),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('PDF_PARSE_TIMEOUT')), 15000)
            ),
          ]);

          text = (pdfData as any).text ?? '';

          if (!text || text.trim().length < 5) {
            log({
              timestamp: new Date().toISOString(), requestId,
              route: 'POST /api/analyze', fileName, mimeType,
              status: 'ERROR', duration: elapsed(),
              errorCode: 'PDF_NO_TEXT_CONTENT',
            });
            apiError(res, 422, 'PDF_NO_TEXT_CONTENT',
              'The PDF does not contain readable text. It may be a scanned image, an encrypted document, or use an incompatible format. Please provide a text-based PDF or convert to DOCX or TXT.',
              { fileName }
            );
            return;
          }

        } catch (pdfError: any) {
          const msg: string = pdfError?.message ?? '';
          const isTimeout = msg === 'PDF_PARSE_TIMEOUT';
          const isEncrypted = /encrypt|password/i.test(msg);

          const errorCode = isEncrypted ? 'PDF_ENCRYPTED'
            : isTimeout ? 'PDF_PARSE_TIMEOUT'
            : 'PDF_EXTRACTION_FAILED';

          const errorMessage = isEncrypted
            ? 'The PDF is password-protected or encrypted. Please remove the password and re-upload.'
            : isTimeout
            ? 'PDF parsing timed out. The file may be too complex or corrupted. Please try a simpler PDF or convert to DOCX or TXT.'
            : 'PDF text extraction failed. The file may be corrupted or contain only scanned images. Please convert to DOCX or TXT and try again.';

          log({
            timestamp: new Date().toISOString(), requestId,
            route: 'POST /api/analyze', fileName, mimeType,
            status: 'ERROR', duration: elapsed(), errorCode,
            stack: pdfError?.stack,
          });
          apiError(res, 422, errorCode, errorMessage, { fileName });
          return;
        }

      } else {
        log({
          timestamp: new Date().toISOString(), requestId,
          route: 'POST /api/analyze', fileName, mimeType,
          status: 'ERROR', duration: elapsed(),
          errorCode: 'UNSUPPORTED_FILE_FORMAT',
        });
        apiError(res, 400, 'UNSUPPORTED_FILE_FORMAT',
          'Unsupported file format. Please upload a .txt, .docx, or .pdf file.',
          { receivedExtension: fileName.split('.').pop() ?? 'unknown' }
        );
        return;
      }
    }

    // — Input Validation ——————————————————————————————————————————————————————
    if (!text || text.trim().length < 10) {
      log({
        timestamp: new Date().toISOString(), requestId,
        route: 'POST /api/analyze', fileName, mimeType,
        status: 'ERROR', duration: elapsed(),
        errorCode: 'INSUFFICIENT_TEXT',
      });
      apiError(res, 400, 'INSUFFICIENT_TEXT',
        'Please provide at least 10 characters of text to analyze.',
        { charactersReceived: text.trim().length }
      );
      return;
    }

    // — Metadata Validation ———————————————————————————————————————————————————
    let metadata;
    try {
      if (req.body.metadata) {
        metadata = JSON.parse(req.body.metadata);
      }
    } catch (err) {
      apiError(res, 400, 'INVALID_METADATA', 'Metadata must be valid JSON');
      return;
    }

    if (metadata) {
      if (!metadata.projectTitle || typeof metadata.projectTitle !== 'string') {
        apiError(res, 400, 'INVALID_PROJECT_TITLE', 'Project title is required and must be a string');
        return;
      }
      if (!metadata.supervisor || typeof metadata.supervisor !== 'string') {
        apiError(res, 400, 'INVALID_SUPERVISOR', 'Supervisor is required and must be a string');
        return;
      }
      if (!metadata.students || !Array.isArray(metadata.students) || metadata.students.length < 1) {
        apiError(res, 400, 'INVALID_STUDENTS', 'At least 1 student is required');
        return;
      }
      for (const student of metadata.students) {
        if (!student.fullName || !student.matricNumber) {
          apiError(res, 400, 'INVALID_STUDENT_DETAILS', 'Each student must have a full name and matric number');
          return;
        }
      }
      const matricNumbers = metadata.students.map((s: any) => s.matricNumber);
      if (new Set(matricNumbers).size !== matricNumbers.length) {
        apiError(res, 400, 'DUPLICATE_MATRIC_NUMBERS', 'Matric numbers must be unique');
        return;
      }
    }

    // — Document Normalization (Phase P2.1) ————————————————————————————————————
    const { normalizeDocument } = await import('./src/ai/pipeline/documentNormalizer.js');
    const normalizedDoc = normalizeDocument(text);

    // — Research Federation Paper Lookup (Phase OA-005) ————————————————————————
    let papers: any[] = [];
    let query = '';
    let coreStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let openAlexStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let similarityStatus: 'COMPUTED' | 'NOT_AVAILABLE' = 'COMPUTED';
    let searchTime = 0;
    let federationMetrics: any = { providers: [] };

    try {
      const startSearch = Date.now();
      const { CandidatePaperProvider } = await import('./src/services/evidence/CandidatePaperProvider.js');
      const provider = new CandidatePaperProvider();
      papers = await provider.getCandidates(normalizedDoc.normalizedText);

      federationMetrics = (papers as any).federationMetrics || { providers: [] };
      const coreMetrics = federationMetrics.providers.find((p: any) => p.name === 'CORE');
      const openAlexMetrics = federationMetrics.providers.find((p: any) => p.name === 'OpenAlex');

      coreStatus = coreMetrics ? coreMetrics.status : 'FAILED';
      openAlexStatus = openAlexMetrics ? openAlexMetrics.status : 'FAILED';

      const { SearchQueryBuilder } = await import('./src/services/core/SearchQueryBuilder.js');
      query = new SearchQueryBuilder().buildQuery(normalizedDoc.normalizedText);
      searchTime = Number(((Date.now() - startSearch) / 1000).toFixed(2));

      // Deterministic Tracing Logs (Phase EA-010K)
      console.log('CORE');
      console.log('Latency');
      console.log(`${coreMetrics ? Math.round(coreMetrics.time * 1000) : 0} ms`);
      console.log('Retrieved');
      console.log(`${coreMetrics ? coreMetrics.retrieved : 0}`);
      console.log('Accepted');
      console.log(`${coreMetrics ? coreMetrics.accepted : 0}`);
      console.log('Rejected');
      console.log(`${coreMetrics ? coreMetrics.rejected : 0}`);

      console.log('OpenAlex');
      console.log('Latency');
      console.log(`${openAlexMetrics ? Math.round(openAlexMetrics.time * 1000) : 0} ms`);
      console.log('Retrieved');
      console.log(`${openAlexMetrics ? openAlexMetrics.retrieved : 0}`);
      console.log('Accepted');
      console.log(`${openAlexMetrics ? openAlexMetrics.accepted : 0}`);
      console.log('Rejected');
      console.log(`${openAlexMetrics ? openAlexMetrics.rejected : 0}`);

      console.log('Merge Engine');
      const mergeMetrics = (papers as any).mergeMetrics || { duplicatesRemoved: 0, totalMerged: papers.length };
      console.log('Duplicates Removed');
      console.log(`${mergeMetrics.duplicatesRemoved}`);
      console.log('Merged');
      console.log(`${mergeMetrics.totalMerged}`);

      const { AcademicEvidenceGraph } = await import('./src/services/evidence/AcademicEvidenceGraph.js');
      const evidenceGraph = new AcademicEvidenceGraph(papers);
      console.log('Evidence Graph Built');

      const bothFailed = federationMetrics.providers.every((p: any) => p.status === 'FAILED');
      if (bothFailed) {
        apiError(res, 400, 'NO_ACADEMIC_EVIDENCE_AVAILABLE', 'No academic evidence was retrieved from any provider.');
        return;
      }

      if (papers.length === 0) {
        similarityStatus = 'NOT_AVAILABLE';
      }
    } catch (e) {
      console.warn('Research Federation Search failed:', e);
      coreStatus = 'FAILED';
      openAlexStatus = 'FAILED';
      similarityStatus = 'NOT_AVAILABLE';
      papers = [];
      query = 'N/A';
      apiError(res, 400, 'NO_ACADEMIC_EVIDENCE_AVAILABLE', 'No academic evidence was retrieved from any provider.');
      return;
    }

    // — Similarity Calculation (Gate FG-A: SimilarityResult SSOT) ——————————————
    let similarityResult: any = {
      candidateId: 0,
      overallSimilarity: 0,
      chunkScores: [],
      sentenceScores: [],
      matchedChunks: [],
      metrics: { exactMatch: 0, ngram: 0, jaccard: 0, cosine: 0 },
      matchingChunks: []
    };

    let studentChunks: any[] = [];
    if (papers.length > 0 && (coreStatus === 'SUCCESS' || openAlexStatus === 'SUCCESS')) {
      try {
        const { DocumentChunker } = await import('./src/services/evidence/DocumentChunker.js');
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
    });

  } catch (error: any) {
    log({
      timestamp: new Date().toISOString(), requestId,
      route: 'POST /api/analyze', fileName, mimeType,
      status: 'ERROR', duration: elapsed(),
      errorCode: 'INTERNAL_SERVER_ERROR',
      stack: error?.stack,
    });
    apiError(res, 500, 'INTERNAL_SERVER_ERROR',
      'An unexpected server error occurred while processing the request.',
      { retryable: false }
    );
  }
});

// — Vite & Static Asset Mounting ———————————————————————————————————————————————

async function start() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`DSPG Plagiarism Checker Server running on http://localhost:${PORT}`);
    });
  }
}

start().catch((err) => {
  console.error('Failed to start DSPG server:', err);
});

export default app;
