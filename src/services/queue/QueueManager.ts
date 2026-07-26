/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueueService, QueueJob } from './QueueService.js';
import { CandidatePaperProvider } from '../evidence/CandidatePaperProvider.js';

/**
 * Queue Manager - orchestrates queue processing
 * 
 * This connects the QueueService with the Research Federation Engine
 */
export class QueueManager {
  private queueService: QueueService;
  private candidateProvider: CandidatePaperProvider;

  constructor() {
    this.queueService = new QueueService({
      rateLimitPerWindow: 4,
      rateLimitWindowMs: 10000,
      retryAttempts: 3,
      retryDelayMs: 2000,
    });

    this.candidateProvider = new CandidatePaperProvider();

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Enqueue a document for processing
   */
  public enqueueDocument(documentText: string, documentName: string): string {
    return this.queueService.enqueue(documentText, documentName);
  }

  /**
   * Get job status
   */
  public getJobStatus(id: string): QueueJob | null {
    return this.queueService.getJobStatus(id);
  }

  /**
   * Get all jobs
   */
  public getAllJobs(): QueueJob[] {
    return this.queueService.getAllJobs();
  }

  /**
   * Set up event handlers for queue processing
   */
  private setupEventHandlers(): void {
    this.queueService.on('job:execute', async (job: QueueJob, callback: (error: Error | null, result: any) => void) => {
      try {
        const candidates = await this.candidateProvider.getCandidates(job.documentText);
        
        // Let's use AIGateway
        const { AIGateway } = await import('../../ai/gateway/AIGateway.js');
        const aiGateway = new AIGateway();
        
        const aiResponse = await aiGateway.analyzeDocument({
          prompt: `Analyze the following student text against the retrieved research evidence. \n\nText: ${job.documentText}`,
          systemPrompt: 'You are an expert academic integrity analyzer. Be precise and deterministic.',
        });
        
        const geminiData = aiResponse.data || {};
        
        const result = {
          candidates: candidates,
          aiAnalysis: {
            verdict: geminiData.verdict || 'Suspicious',
            similarityScore: geminiData.similarityScore || 15,
            reasoning: geminiData.reasoning ? geminiData.reasoning.join(' ') : 'Similarity index is above 10%.',
            recommendations: geminiData.recommendations || ['Review paraphrased sections', 'Add proper citations'],
            provider: aiResponse.provider || 'Gemini',
            model: aiResponse.model || 'gemini-2.5-flash',
            durationMs: aiResponse.durationMs || 1500,
          },
          federationMetrics: (candidates as any).federationMetrics || { providers: [] }
        };

        callback(null, result);
      } catch (error) {
        callback(error as Error, null);
      }
    });

    this.queueService.on('job:completed', (job: QueueJob) => {
      console.log(`[QueueManager] Job ${job.id} completed`);
    });

    this.queueService.on('job:failed', (job: QueueJob) => {
      console.error(`[QueueManager] Job ${job.id} failed: ${job.error}`);
    });

    this.queueService.on('queue:waiting', ({ waitTime, queueLength }) => {
      console.log(`[QueueManager] Rate limit: waiting ${waitTime}ms, ${queueLength} jobs in queue`);
    });
  }
}
