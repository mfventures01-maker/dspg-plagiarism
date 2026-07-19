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

// Removed top-level pdf-parse import to prevent DOMMatrix ReferenceError on Vercel startup
import { CoreAIService } from './src/ai/gateway/CoreAIService.js';

dotenv.config();

const app = express();
const PORT = 3000;

// ── Structured Logging ────────────────────────────────────────────────────────

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

  // Stack traces emitted to stderr — server-side only, never sent to clients
  if (entry.stack) {
    console.error(`[STACK] request=${entry.requestId.substring(0, 8)}\n${entry.stack}`);
  }
}

// ── API Response Helpers ──────────────────────────────────────────────────────

function apiError(
  res: express.Response,
  status: number,
  code: string,
  message: string,
  details?: object
): void {
  res.status(status).json({
    success: false,
    error: { code, message, details: details ?? {} },
  });
}

// ── File Upload ───────────────────────────────────────────────────────────────

// In-memory file upload handling (strict data privacy, no disk persistence)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ── AI Gateway ────────────────────────────────────────────────────────────────

const coreAIService = new CoreAIService();

// ── Request ID Middleware ─────────────────────────────────────────────────────

app.use((req, _res, next) => {
  (req as any).requestId = randomUUID();
  next();
});

// ── Standard Middleware ───────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── CORS ──────────────────────────────────────────────────────────────────────

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

// ── Health Check ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ── Document Analysis and Plagiarism Detection API ────────────────────────────

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  const requestId: string = (req as any).requestId ?? randomUUID();
  const elapsed = () => `${Date.now() - startTime}ms`;

  let text = req.body.text || '';
  let fileName = 'Pasted Text Input';
  let mimeType = 'text/plain';

  try {
    // ── Text Extraction ───────────────────────────────────────────────────────
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
        // ── Hardened PDF Extraction ───────────────────────────────────────────
        try {
          const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

          // 15-second timeout safeguard — prevents hangs on corrupt or oversized PDFs
          const pdfData = await Promise.race([
            (pdfParse as any)(uint8Array),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('PDF_PARSE_TIMEOUT')), 15000)
            ),
          ]);

          text = (pdfData as any).text ?? '';

          // Detect PDFs with no extractable text (scanned images, empty pages, etc.)
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

    // ── Input Validation ──────────────────────────────────────────────────────
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

    // ── Metadata Validation ───────────────────────────────────────────────────
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
      if (!metadata.academicSession || typeof metadata.academicSession !== 'string') {
        apiError(res, 400, 'INVALID_ACADEMIC_SESSION', 'Academic session is required and must be a string');
        return;
      }
      if (!metadata.department || typeof metadata.department !== 'string') {
        apiError(res, 400, 'INVALID_DEPARTMENT', 'Department is required and must be a string');
        return;
      }
      if (!metadata.students || !Array.isArray(metadata.students) || metadata.students.length < 1 || metadata.students.length > 5) {
        apiError(res, 400, 'INVALID_STUDENTS', 'Between 1 and 5 students are required');
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

    // ── Document Normalization (Phase P2.1) ───────────────────────────────────
    const { normalizeDocument } = await import('./src/ai/pipeline/documentNormalizer.js');
    const normalizedDoc = normalizeDocument(text);
    
    // ── AI Plagiarism Analysis (Phase P2.2 & S3.2) ────────────────────────────
    const aiResponse = await coreAIService.generate({
      prompt: `Analyze the following text for potential plagiarism or AI generation:\n\n${normalizedDoc.normalizedText}`,
      systemPrompt: 'You are an expert academic integrity analyzer. Be precise and deterministic.',
    });
    
    // Add request specific timing
    const durationMs = Date.now() - startTime;
    normalizedDoc.analysisDuration = `${(durationMs / 1000).toFixed(1)}s`;

    log({
      timestamp: new Date().toISOString(), requestId,
      route: 'POST /api/analyze', fileName, mimeType,
      status: 'SUCCESS', duration: elapsed(),
    });

    res.json({ 
      success: true, 
      data: {
        document: normalizedDoc,
        aiAnalysis: aiResponse
      } 
    });

  } catch (error: any) {
    // ── Global Catch — No raw stack traces to clients ─────────────────────────
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

// ── Vite & Static Asset Mounting ──────────────────────────────────────────────

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
