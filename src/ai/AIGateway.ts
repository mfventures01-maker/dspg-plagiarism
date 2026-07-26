/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InterpretationRequest } from './contracts/InterpretationRequest';
import { InterpretationResult } from './contracts/InterpretationResult';
import { ProviderRegistry } from './registry/ProviderRegistry';
import { TelemetryService } from './telemetry/TelemetryService';
import { RetryEngine } from './retry/RetryEngine';
import { RetryPolicy } from './retry/RetryPolicy';
import { ProviderFailoverEngine } from './failover/ProviderFailoverEngine';

/**
 * Single Responsibility: Orchestrate AI interpretation requests.
 * Abstracts the underlying provider (Gemini, NVIDIA) from the application.
 */
export class AIGateway {
  private readonly registry: ProviderRegistry;
  private readonly telemetry: TelemetryService;
  private readonly retryPolicy: RetryPolicy;

  constructor(
    registry: ProviderRegistry, 
    telemetry: TelemetryService,
    retryPolicy?: RetryPolicy
  ) {
    this.registry = registry;
    this.telemetry = telemetry;
    this.retryPolicy = retryPolicy || {
      maxAttempts: 3,
      initialDelayMs: 1000,
      exponentialBackoff: true,
      multiplier: 2,
      retryableErrors: ['TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR', 'NETWORK_ERROR']
    };
  }

  /**
   * Invokes the active AI Provider and returns the validated InterpretationResult.
   */
  public async interpret(request: InterpretationRequest): Promise<InterpretationResult> {
    
    const activeExec = this.telemetry.startExecution('FailoverEngine', 'Resolution');
    const retryEngine = new RetryEngine(this.retryPolicy);
    const failoverEngine = new ProviderFailoverEngine(this.registry, retryEngine);
    
    // We import PromptBuilder locally here to avoid circular dependency
    const { PromptBuilder } = require('./prompts/PromptBuilder');
    const promptBuilder = new PromptBuilder();
    const systemPrompt = promptBuilder.buildSystemPrompt();
    const userPrompt = promptBuilder.buildUserPrompt(request);

    try {
      const failoverResult = await failoverEngine.execute((provider) => provider.analyzeDocument({
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.1,
        maxTokens: 2048
      }));

      if (failoverResult.successful && failoverResult.result) {
        const aiResponse = failoverResult.result;
        const resultData = aiResponse.data as any;
        
        // Mock InterpretationResult based on what providers used to return
        const interpretationResult: InterpretationResult = {
          version: resultData.version || '1.0',
          plagiarismType: resultData.plagiarismType || 'None',
          confidence: resultData.confidence || 0,
          summary: resultData.summary || '',
          evidenceExplanation: resultData.evidenceExplanation || [],
          lecturerComments: resultData.lecturerComments || '',
          studentFeedback: resultData.studentFeedback || '',
          recommendations: resultData.recommendations || [],
          metadata: {
             provider: aiResponse.provider,
             model: aiResponse.model,
             promptTokens: 0,
             completionTokens: 0,
             totalTokens: 0
          }
        };

        this.telemetry.completeExecution(
          activeExec,
          0,
          0,
          failoverResult.attempts - failoverResult.fallbacksUsed - 1, // approximate retries on the final provider
          failoverResult.retryReasons,
          failoverResult.providersAttempted,
          failoverResult.fallbacksUsed > 0,
          failoverResult.provider,
          failoverResult.failedProviders,
          failoverResult.attempts
        );
        return interpretationResult;
      }
      
      throw new Error(failoverResult.finalError || 'AI_EXECUTION_ERROR');
    } catch (error: any) {
      // In case of AIUnavailableError or config error propagating up
      const failedProviders = error.failedProviders || [];
      const providersAttempted = failedProviders.length > 0 ? failedProviders : [this.registry.getPrimary()?.name || 'unknown'];

      this.telemetry.failExecution(
        activeExec, 
        error.message || error.name || 'AI_EXECUTION_ERROR',
        0,
        [],
        providersAttempted,
        failedProviders.length > 0,
        failedProviders,
        providersAttempted.length
      );
      
      throw error;
    }
  }
}
