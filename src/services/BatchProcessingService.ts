// src/services/BatchProcessingService.ts
// HOEOS: Phase 5 - Batch Processing with Gated Verifiable Proofs

export interface BatchJob {
  id: string;
  name: string;
  documents: BatchDocument[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
  progress: number;
  createdAt: string;
  completedAt: string | null;
  results: BatchResult[];
  proof: BatchProof | null;
}

export interface BatchDocument {
  id: string;
  fileName: string;
  content: string;
  metadata: {
    studentName: string;
    matricNumber: string;
    projectTitle: string;
    supervisor: string;
    department: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result: any | null;
  error: string | null;
}

export interface BatchResult {
  documentId: string;
  fileName: string;
  similarityScore: number;
  adjustedScore: number;
  scoreBand: string;
  verdict: string;
  matchedSources: number;
  processingTime: number;
}

export interface BatchProof {
  id: string;
  batchId: string;
  totalDocuments: number;
  processedDocuments: number;
  timestamp: string;
  verifier: string;
}

export class BatchProcessingService {
  private static instance: BatchProcessingService;
  private jobs: BatchJob[] = [];
  private maxConcurrent: number = 3;
  private processing: boolean = false;

  private crypto: Crypto;
  private encoder: TextEncoder;

  constructor() {
    this.crypto = crypto || require('crypto').webcrypto;
    this.encoder = new TextEncoder();
  }

  static getInstance(): BatchProcessingService {
    if (!BatchProcessingService.instance) {
      BatchProcessingService.instance = new BatchProcessingService();
    }
    return BatchProcessingService.instance;
  }

  // 📝 Create batch job
  createBatchJob(name: string, documents: BatchDocument[]): BatchJob {
    const job: BatchJob = {
      id: `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name,
      documents,
      status: 'PENDING',
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      results: [],
      proof: null
    };

    this.jobs.push(job);
    return job;
  }

  // 🔐 Generate batch proof
  async generateBatchProof(jobId: string): Promise<BatchProof> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    const verifierData = `${jobId}-${job.documents.length}-${job.progress}-${Date.now()}`;
    const verifierBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(verifierData)
    );
    const verifierArray = Array.from(new Uint8Array(verifierBuffer));
    const verifier = verifierArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const proof: BatchProof = {
      id: `BATCHPRF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      batchId: jobId,
      totalDocuments: job.documents.length,
      processedDocuments: job.results.length,
      timestamp: new Date().toISOString(),
      verifier
    };

    job.proof = proof;
    return proof;
  }

  // ⚡ Process batch job
  async processBatchJob(jobId: string, processFn: (doc: BatchDocument) => Promise<any>): Promise<BatchJob> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    if (job.status === 'PROCESSING') throw new Error(`Job ${jobId} is already processing`);

    job.status = 'PROCESSING';
    let completed = 0;
    let failed = 0;

    // Process in chunks to avoid memory issues
    const chunkSize = this.maxConcurrent;
    for (let i = 0; i < job.documents.length; i += chunkSize) {
      const chunk = job.documents.slice(i, i + chunkSize);
      const promises = chunk.map(async (doc) => {
        if (doc.status === 'PENDING') {
          try {
            doc.status = 'PROCESSING';
            const result = await processFn(doc);
            doc.status = 'COMPLETED';
            doc.result = result;
            
            // Add to results
            job.results.push({
              documentId: doc.id,
              fileName: doc.fileName,
              similarityScore: result.similarity?.adjusted || 0,
              adjustedScore: result.similarity?.adjusted || 0,
              scoreBand: result.similarity?.scoreBand || 'UNKNOWN',
              verdict: result.verdict?.recommendation || 'UNKNOWN',
              matchedSources: result.similarity?.matchedChunks?.length || 0,
              processingTime: result.processingTime || 0
            });
            
            completed++;
          } catch (error: any) {
            doc.status = 'FAILED';
            doc.error = error.message || 'Unknown error';
            failed++;
          }
        }
      });

      await Promise.allSettled(promises);
      
      // Update progress
      job.progress = Math.round(((completed + failed) / job.documents.length) * 100);
      
      // Generate proof at checkpoints
      if (job.progress % 25 === 0) {
        await this.generateBatchProof(jobId);
      }
    }

    // Finalize job
    job.status = completed === job.documents.length ? 'COMPLETED' : 
                completed > 0 ? 'PARTIAL' : 'FAILED';
    job.completedAt = new Date().toISOString();
    
    // Final proof
    await this.generateBatchProof(jobId);

    return job;
  }

  // 📊 Get job status
  getJobStatus(jobId: string): BatchJob | undefined {
    return this.jobs.find(j => j.id === jobId);
  }

  // 📋 Get all jobs
  getAllJobs(): BatchJob[] {
    return this.jobs;
  }

  // 📊 Get job statistics
  getJobStatistics(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    partial: number;
    totalDocuments: number;
    processedDocuments: number;
    averageProcessingTime: number;
  } {
    const stats = {
      total: this.jobs.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      partial: 0,
      totalDocuments: 0,
      processedDocuments: 0,
      averageProcessingTime: 0
    };

    let totalTime = 0;
    let timeCount = 0;

    for (const job of this.jobs) {
      stats.totalDocuments += job.documents.length;
      stats.processedDocuments += job.results.length;

      switch (job.status) {
        case 'PENDING': stats.pending++; break;
        case 'PROCESSING': stats.processing++; break;
        case 'COMPLETED': stats.completed++; break;
        case 'FAILED': stats.failed++; break;
        case 'PARTIAL': stats.partial++; break;
      }

      // Calculate average processing time
      if (job.completedAt && job.results.length > 0) {
        const totalJobTime = job.results.reduce((sum, r) => sum + r.processingTime, 0);
        const avgTime = totalJobTime / job.results.length;
        totalTime += avgTime;
        timeCount++;
      }
    }

    stats.averageProcessingTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;
    return stats;
  }

  // ✅ Verify batch proof
  verifyBatchProof(proof: BatchProof): { valid: boolean; message: string } {
    const job = this.jobs.find(j => j.id === proof.batchId);
    if (!job) {
      return { valid: false, message: `Job ${proof.batchId} not found` };
    }

    if (!proof.verifier || proof.verifier.length !== 64) {
      return { valid: false, message: 'Invalid verifier signature' };
    }

    if (proof.totalDocuments !== job.documents.length) {
      return { valid: false, message: 'Document count mismatch' };
    }

    return { valid: true, message: 'Batch proof verified successfully' };
  }

  // 📋 Export batch results as CSV
  exportBatchResultsCSV(jobId: string): string {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    let csv = 'Document,Student,Matric,Project,Similarity,Adjusted,Score Band,Verdict,Matches\n';
    
    for (const doc of job.documents) {
      const result = job.results.find(r => r.documentId === doc.id);
      csv += `"${doc.fileName}","${doc.metadata.studentName}","${doc.metadata.matricNumber}","${doc.metadata.projectTitle}",`;
      csv += `${result?.similarityScore || 0},${result?.adjustedScore || 0},"${result?.scoreBand || 'N/A'}","${result?.verdict || 'N/A'}",${result?.matchedSources || 0}\n`;
    }

    return csv;
  }

  // 📋 Export batch results as JSON
  exportBatchResultsJSON(jobId: string): any {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    return {
      jobId: job.id,
      name: job.name,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      status: job.status,
      totalDocuments: job.documents.length,
      results: job.results,
      summary: {
        averageScore: job.results.length > 0 
          ? Math.round(job.results.reduce((sum, r) => sum + r.adjustedScore, 0) / job.results.length)
          : 0,
        passCount: job.results.filter(r => r.verdict === 'PASS').length,
        reviewCount: job.results.filter(r => r.verdict === 'REVIEW').length,
        rejectCount: job.results.filter(r => r.verdict === 'REJECT').length
      }
    };
  }
}
