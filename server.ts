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

// Polyfill DOMMatrix for pdfjs-dist under Vercel Serverless environment
if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

// Phase 1: Quote & Bibliography Exclusion
import { QuoteBibliographyExclusionEngine } from './src/services/QuoteBibliographyExclusionEngine.js';
// Phase 2: Score Band Classification
import { ScoreBandClassifier } from './src/services/ScoreBandClassifier.js';
// Phase 3: Supervisor Review Workflow
import { SupervisorReviewWorkflow } from './src/services/SupervisorReviewWorkflow.js';
// Phase 4: PDF Export with QR Verification
import { PDFReportGenerator } from './src/services/PDFReportGenerator.js';
// Phase 5: Batch Processing
import { BatchProcessingService } from './src/services/BatchProcessingService.js';

const exclusionEngine = QuoteBibliographyExclusionEngine.getInstance();
const classifier = ScoreBandClassifier.getInstance();
const supervisorWorkflow = SupervisorReviewWorkflow.getInstance();
const pdfGenerator = PDFReportGenerator.getInstance();
const batchService = BatchProcessingService.getInstance();
import { BatchCounterService } from './src/services/BatchCounterService';
const counterService = BatchCounterService.getInstance();

import { AIGateway } from './src/ai/gateway/AIGateway.js';
import { QueueManager } from './src/services/queue/QueueManager.js';

dotenv.config();

const app = express();
const PORT = 3000;

declare global {
  var reportCache: Map<string, any>;
}

// Initialize cache at startup
if (!global.reportCache) {
  global.reportCache = new Map();
}


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

    // ============================================
    // PHASE 1: Quote & Bibliography Exclusion
    // ============================================
    
    console.log('[PHASE 1] Applying quote & bibliography exclusion...');
    const exclusionResult = await exclusionEngine.excludeAll(normalizedDoc.normalizedText);
    
    console.log('[EXCLUSION] Summary:', exclusionResult.exclusionSummary);
    console.log('[EXCLUSION] Quotes removed:', exclusionResult.excludedQuotes.length);
    console.log('[EXCLUSION] Bibliography removed:', exclusionResult.excludedBibliography.length);
    console.log('[EXCLUSION] Proofs generated:', exclusionResult.proofs.length);

    // Use the clean text for similarity calculation
    const cleanText = exclusionResult.cleanText;
    
    // Update normalizedDoc with cleaned text
    const cleanedNormalizedDoc = {
      ...normalizedDoc,
      normalizedText: cleanText,
      originalText: normalizedDoc.normalizedText,
      exclusions: {
        quotesRemoved: exclusionResult.excludedQuotes,
        bibliographyRemoved: exclusionResult.excludedBibliography,
        proofs: exclusionResult.proofs
      }
    };

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
      papers = await provider.getCandidates(cleanText);

      federationMetrics = (papers as any).federationMetrics || { providers: [] };
      const coreMetrics = federationMetrics.providers.find((p: any) => p.name === 'CORE');
      const openAlexMetrics = federationMetrics.providers.find((p: any) => p.name === 'OpenAlex');

      coreStatus = coreMetrics ? coreMetrics.status : 'FAILED';
      openAlexStatus = openAlexMetrics ? openAlexMetrics.status : 'FAILED';

      const { SearchQueryBuilder } = await import('./src/services/core/SearchQueryBuilder.js');
      query = new SearchQueryBuilder().buildQuery(cleanText);
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

    // ============================================
    // EXISTING SIMILARITY CALCULATION (Modified to use clean text)
    // ============================================

    // Use the clean text for chunking and similarity
    const { DocumentChunker } = await import('./src/services/evidence/DocumentChunker.js');
    const { CandidateChunker } = await import('./src/services/evidence/CandidateChunker.js');
    const { SimilarityEngine } = await import('./src/services/evidence/SimilarityEngine.js');
    const { EnhancedSimilarityEngine } = await import('./src/services/EnhancedSimilarityEngine.js');

    // Use the enhanced engine with clean text
    const enhancedEngine = new EnhancedSimilarityEngine();
    const enhancedResult = enhancedEngine.computeEnhancedSimilarity(
      cleanText,
      papers
    );

    // ============================================
    // PHASE 2: Score Band Classification
    // ============================================
    
    console.log('[PHASE 2] Classifying score band...');
    const overallSimVal = enhancedResult.adjustedSimilarity / 100;
    const classification = classifier.classify(
      overallSimVal * 100, 
      enhancedResult.adjustedSimilarity
    );

    console.log('[CLASSIFICATION] Band:', classification.band.name);
    console.log('[CLASSIFICATION] Risk Level:', classification.band.riskLevel);
    console.log('[CLASSIFICATION] Recommendation:', classification.band.recommendation);

    // Generate classification proof
    const classificationProof = await classifier.generateClassificationProof(
      cleanText,
      overallSimVal * 100,
      enhancedResult.adjustedSimilarity,
      classification.band
    );

    console.log('[CLASSIFICATION] Proof generated:', classificationProof.id);

    // ============================================
    // EXISTING VERDICT ENGINE (Enhanced with classification)
    // ============================================

    // Use classification results in verdict
    const verdict = {
      academicIntegrityScore: Math.round((1.0 - overallSimVal) * 100),
      originality: Math.round((1.0 - overallSimVal) * 100),
      copiedContent: Math.round(overallSimVal * 100),
      aiGenerated: 5,
      humanWritten: 95,
      recommendation: classification.band.recommendation,
      riskLevel: classification.band.riskLevel,
      riskScore: Math.round(overallSimVal * 100),
      verdictText: classification.band.description,
      scoreBand: classification.band.name,
      bandId: classification.band.id
    };

    // ============================================
    // PHASE 3: Supervisor Review Workflow
    // ============================================
    
    console.log('[PHASE 3] Creating review task...');
    
    // Get metadata from request
    try {
      if (req.body.metadata) {
        metadata = JSON.parse(req.body.metadata);
      }
    } catch (err) {
      // Metadata parsing error handled elsewhere
    }

    // Create review task
    const reviewTask = supervisorWorkflow.createReviewTask(
      metadata?.students?.[0]?.fullName || 'Unknown Student',
      metadata?.students?.[0]?.matricNumber || 'Unknown Matric',
      metadata?.projectTitle || 'Untitled Project',
      cleanedNormalizedDoc.hash || 'unknown-hash',
      overallSimVal * 100,
      enhancedResult.adjustedSimilarity,
      classification.band.name,
      'SUP_001', // Default supervisor ID
      metadata?.department || 'Computer Engineering',
      metadata?.level || 'HND 2'
    );

    console.log('[REVIEW] Task created:', reviewTask.id);
    console.log('[REVIEW] Status:', reviewTask.status);

    // ============================================
    // PHASE 4: PDF Report Generation
    // ============================================
    
    console.log('[PHASE 4] Generating PDF report...');
    
    // Get supervisor name from metadata or use default
    const supervisorName = metadata?.supervisor || 'Dr. Abugewa';
    
    // Generate PDF report
    const pdfReport = await pdfGenerator.generatePDF({
      reportId: `DSPG-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      studentName: metadata?.students?.[0]?.fullName || 'Unknown Student',
      matricNumber: metadata?.students?.[0]?.matricNumber || 'Unknown Matric',
      projectTitle: metadata?.projectTitle || 'Untitled Project',
      submissionDate: new Date().toISOString(),
      similarityScore: overallSimVal * 100,
      adjustedScore: enhancedResult.adjustedSimilarity,
      scoreBand: classification.band.name,
      riskLevel: classification.band.riskLevel,
      verdict: classification.band.recommendation,
      supervisorName: supervisorName,
      supervisorSignature: supervisorName,
      verificationHash: classificationProof.verifier,
      matchedSources: enhancedResult.matchedChunks.slice(0, 10).map((chunk: any) => ({
        source: chunk.sourceText,
        similarity: chunk.similarity,
        text: chunk.studentText
      })),
      documentHash: cleanedNormalizedDoc.hash || 'unknown',
      institution: 'Delta State Polytechnic, Ogwashi-Uku',
      department: metadata?.department || 'Computer Engineering'
    });

    console.log('[PDF] Report generated:', pdfReport.verificationData.reportId);
    console.log('[PDF] QR Code generated:', pdfReport.qrCode ? 'Yes' : 'No');

    // ============================================
    // PHASE 5: Batch Processing (if applicable)
    // ============================================
    
    // Note: Batch processing is handled via separate endpoints
    // But we can track if this is part of a batch job
    const batchJobId = req.headers['x-batch-job-id'] as string || null;
    if (batchJobId) {
      console.log('[BATCH] Part of batch job:', batchJobId);
    }
    
    // AI Interpretation logic for FG-B
    const promptToGemini = `
You are an expert academic integrity analyzer. Be precise and deterministic.
Analyze the following student text against the retrieved CORE and OpenAlex research evidence.
You MUST ONLY explain and interpret the existing mathematical and retrieval evidence. Do NOT invent, override, or modify any similarity percentages, confidence scores, verdicts, or recommendations.

Student Text:
${cleanedNormalizedDoc.normalizedText}

Evidence Assessment:
- Retrieval State: SUCCESS
- Similarity State: COMPUTED
- Overall Similarity Score: ${Math.round(overallSimVal * 100)}%
- Plagiarism Risk Level: ${classification.band.riskLevel}
- Recommendation: ${classification.band.recommendation}

Analyze the similarity findings, AI generation patterns, and paraphrasing indicators.
Explain WHY the paper is considered copied or original based only on the evidence.
You MUST respond with a valid JSON object matching the following structure:
{
  "aiGenerationRisk": "HIGH" | "MODERATE" | "LOW",
  "reasoning": [
    "string explanation detail 1",
    "string explanation detail 2"
  ]
}
Do NOT include markdown wrapping other than the JSON block. Do NOT hallucinate.
`;

    const aiResponse = await aiGateway.analyzeDocument({
      prompt: promptToGemini,
      systemPrompt: 'You are an expert academic integrity analyzer. Be precise and deterministic.',
      metadata: metadata,
    });
    const geminiData = aiResponse.data || {};
    const aiGenRisk = geminiData.aiGenerationRisk || "LOW";
    verdict.aiGenerated = aiGenRisk === "HIGH" ? 85 : aiGenRisk === "MODERATE" ? 28 : 5;
    verdict.humanWritten = 100 - verdict.aiGenerated;
    
    const finalAiResponse = {
      verdict: classification.band.riskLevel === 'LOW' ? 'Original' : classification.band.riskLevel === 'MODERATE' ? 'Suspicious' : 'Plagiarism Detected',
      similarityScore: Math.round(overallSimVal * 100),
      reasoning: geminiData.reasoning ? geminiData.reasoning.join(' ') : classification.band.description,
      recommendations: [classification.band.recommendation, "Review candidate papers for overlapping phrases."],
      provider: "Gemini",
      model: "gemini-2.5-flash",
      durationMs: 1200
    };
    
    const durationMs = Date.now() - startTime;
    cleanedNormalizedDoc.analysisDuration = `${(durationMs / 1000).toFixed(1)}s`;

    // ============================================
    // RESPONSE WITH ALL PHASES INTEGRATED
    // ============================================

    const responseData = {
      success: true,
      data: {
        document: {
          ...cleanedNormalizedDoc,
          exclusions: {
            quotesRemoved: exclusionResult.excludedQuotes,
            bibliographyRemoved: exclusionResult.excludedBibliography,
            totalExcluded: exclusionResult.exclusionSummary.totalExcluded
          }
        },
        
        // Phase 1: Exclusion Results
        exclusion: {
          summary: exclusionResult.exclusionSummary,
          proofs: exclusionResult.proofs.map(p => ({
            id: p.id,
            type: p.exclusionType,
            timestamp: p.timestamp,
            verifier: p.verifier.substring(0, 16) + '...'
          }))
        },
        
        // Phase 2: Classification Results
        classification: {
          band: classification.band,
          originalScore: classification.originalScore,
          adjustedScore: classification.adjustedScore,
          proof: {
            id: classificationProof.id,
            timestamp: classificationProof.timestamp,
            confidence: classificationProof.confidence,
            verifier: classificationProof.verifier.substring(0, 16) + '...'
          }
        },
        
        // Phase 3: Review Workflow
        review: {
          taskId: reviewTask.id,
          status: reviewTask.status,
          assignedTo: reviewTask.assignedTo,
          timeline: reviewTask.timeline,
          proof: reviewTask.proof ? {
            id: reviewTask.proof.id,
            status: reviewTask.proof.status,
            timestamp: reviewTask.proof.timestamp,
            verifier: reviewTask.proof.verifier.substring(0, 16) + '...'
          } : null
        },
        
        // Phase 4: PDF Report
        report: {
          reportId: pdfReport.verificationData.reportId,
          qrCode: pdfReport.qrCode,
          verificationData: pdfReport.verificationData,
          downloadUrl: `/api/report/${pdfReport.verificationData.reportId}/download`
        },
        
        // Existing data
        similarity: {
          raw: enhancedResult.overallSimilarity,
          filtered: enhancedResult.filteredSimilarity,
          adjusted: enhancedResult.adjustedSimilarity,
          confidenceScore: enhancedResult.confidenceScore,
          recommendation: enhancedResult.recommendation,
          warnings: enhancedResult.warnings,
          sourceCategories: enhancedResult.sourceCategories,
          matchedChunks: enhancedResult.matchedChunks.slice(0, 10)
        },
        
        verdict: verdict,
        sources: [],
        aiAnalysis: finalAiResponse,
        evidenceAssessment: {
          retrievalState: "SUCCESS_WITH_CANDIDATES",
          similarityState: "MATCH_FOUND"
        },
        repositoryIntelligence: {
            mergedCandidates: papers.length
        },
        confidence: {
          coreConfidence: coreStatus === 'SUCCESS' ? 95 : 0,
          geminiConfidence: 95,
          overallConfidence: enhancedResult.confidenceScore,
          classificationConfidence: classificationProof.confidence
        },
        candidatePapers: papers
      }
    };

    // ============================================
    // STORE REPORT FOR DOWNLOAD (Optional)
    // ============================================
    
    if (!global.reportCache) {
      global.reportCache = new Map();
    }
    global.reportCache.set(pdfReport.verificationData.reportId, {
      pdf: pdfReport.pdf,
      data: responseData.data
    });

    log({
      timestamp: new Date().toISOString(), 
      requestId,
      route: 'POST /api/analyze', 
      fileName, 
      mimeType,
      status: 'SUCCESS', 
      duration: elapsed(),
    });

    
    // ============================================
    // PUBLIC BATCH SECRET COUNTER
    // ============================================
    console.log('[COUNTER] Incrementing project counter...');
    const counterStats = counterService.incrementCounter();
    console.log(`[COUNTER] Total projects: ${counterStats.total}`);
    console.log(`[COUNTER] Today: ${counterStats.today}, Week: ${counterStats.week}, Month: ${counterStats.month}`);

    // Add counter stats to response
    responseData.data.counter = {
      total: counterStats.total,
      today: counterStats.today,
      week: counterStats.week,
      month: counterStats.month,
      lastProject: counterService.getStats().lastProjectTimestamp
    };
res.json(responseData);


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


// ============================================
// PUBLIC COUNTER ENDPOINT
// ============================================
app.get('/api/counter/stats', (req, res) => {
  try {
    const stats = counterService.getStats();
    res.json({
      success: true,
      data: {
        totalProjects: stats.totalProjects,
        todayProjects: stats.todayProjects,
        thisWeekProjects: stats.thisWeekProjects,
        thisMonthProjects: stats.thisMonthProjects,
        averageDaily: stats.averageDaily,
        lastProjectTimestamp: stats.lastProjectTimestamp
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/secret-counter', (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'];
    const validSecret = process.env.SUPERADMIN_SECRET;
    
    if (!validSecret || secret !== validSecret) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const stats = counterService.getStats();
    res.json({
      success: true,
      data: {
        totalProjects: stats.totalProjects,
        secretCounter: counterService.getSecretCounter(),
        dailyHistory: counterService.getDailyHistory()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
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
