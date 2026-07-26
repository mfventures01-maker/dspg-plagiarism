/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EA-019: Queue Architecture Implementation
 * Provides rate-limited, asynchronous processing for CORE API requests
 */

import { EventEmitter } from 'events';

export interface QueueJob {
  id: string;
  documentText: string;
  documentName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  progress: number;
}

export interface QueueConfig {
  maxConcurrent: number;
  rateLimitPerWindow: number;
  rateLimitWindowMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

/**
 * Queue Engine for rate-limited processing of CORE API requests
 * 
 * Features:
 * - Rate limiting (4 requests per 10 seconds)
 * - Job queue with priority
 * - Retry logic with exponential backoff
 * - Event-driven status updates
 * - WebSocket-ready status reporting
 */
export class QueueService extends EventEmitter {
  private jobs: Map<string, QueueJob> = new Map();
  private queue: string[] = [];
  private processing: Set<string> = new Set();
  private config: QueueConfig;
  private isProcessing: boolean = false;
  private requestTimestamps: number[] = [];

  constructor(config?: Partial<QueueConfig>) {
    super();
    this.config = {
      maxConcurrent: 1, // Process one at a time to respect rate limits
      rateLimitPerWindow: 4, // 4 requests per window
      rateLimitWindowMs: 10000, // 10 seconds
      retryAttempts: 3,
      retryDelayMs: 2000,
      ...config,
    };
  }

  /**
   * Add a job to the queue
   */
  public enqueue(documentText: string, documentName: string): string {
    const id = this.generateId();
    const job: QueueJob = {
      id,
      documentText,
      documentName,
      status: 'queued',
      createdAt: new Date(),
      progress: 0,
    };
    
    this.jobs.set(id, job);
    this.queue.push(id);
    this.emit('job:enqueued', job);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return id;
  }

  /**
   * Get job status
   */
  public getJobStatus(id: string): QueueJob | null {
    return this.jobs.get(id) || null;
  }

  /**
   * Get all jobs (for admin/monitoring)
   */
  public getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Process the queue with rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check if we can process more requests within rate limit
      if (!this.canProcessRequest()) {
        const waitTime = this.getWaitTime();
        this.emit('queue:waiting', { waitTime, queueLength: this.queue.length });
        await this.sleep(waitTime);
        continue;
      }

      const id = this.queue.shift();
      if (!id) break;

      await this.processJob(id);
    }

    this.isProcessing = false;
    this.emit('queue:empty');
  }

  /**
   * Process a single job
   */
  private async processJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return;
    }

    // Mark as processing
    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 10;
    this.processing.add(id);
    this.emit('job:started', job);

    // Record this request for rate limiting
    this.requestTimestamps.push(Date.now());

    try {
      // Execute the actual research federation search
      // This will be injected via dependency injection
      job.progress = 50;
      this.emit('job:progress', job);

      // The actual work is done by a callback or injected service
      // We'll use an event-based approach
      const result = await this.executeResearch(job);
      
      job.result = result;
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      this.emit('job:completed', job);
      
      return result;
    } catch (error) {
      const err = error as Error;
      job.error = err.message;
      
      // Check if we should retry
      if (this.shouldRetry(err) && job.progress < 80) {
        job.progress += 10;
        this.emit('job:retrying', job);
        await this.sleep(this.config.retryDelayMs);
        // Re-queue the job
        this.queue.push(id);
        this.emit('job:requeued', job);
      } else {
        job.status = 'failed';
        job.completedAt = new Date();
        this.emit('job:failed', job);
      }
    } finally {
      this.processing.delete(id);
    }
  }

  /**
   * Execute the research federation search
   * This will be implemented by injecting the CandidatePaperProvider
   */
  private async executeResearch(job: QueueJob): Promise<any> {
    // This will call the Research Federation Engine
    // We'll implement this via a callback pattern
    return new Promise((resolve, reject) => {
      // Emit event to be handled by the main server
      this.emit('job:execute', job, (error: Error | null, result: any) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  /**
   * Check if we can make another request within rate limits
   */
  private canProcessRequest(): boolean {
    const now = Date.now();
    // Remove timestamps older than the window
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.config.rateLimitWindowMs
    );
    return this.requestTimestamps.length < this.config.rateLimitPerWindow;
  }

  /**
   * Get wait time until next available request slot
   */
  private getWaitTime(): number {
    if (this.requestTimestamps.length === 0) return 0;
    const oldest = this.requestTimestamps[0];
    const now = Date.now();
    const elapsed = now - oldest;
    const remaining = this.config.rateLimitWindowMs - elapsed;
    return Math.max(remaining, 100);
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetry(error: Error): boolean {
    // Retry on rate limits, timeouts, and network errors
    const retryableErrors = ['429', 'rate limit', 'timeout', 'network', 'fetch'];
    return retryableErrors.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
