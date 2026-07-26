/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoreSearchResult, CoreSearchOptions, CoreRawResponse } from './CoreTypes';
import { CoreNormalizer } from './CoreNormalizer';
import { Logger } from '../../utils/Logger';
import {
  CoreAuthenticationError,
  CoreNetworkError,
  CoreRateLimitError,
  CoreServerError,
  CoreTimeoutError,
  CoreUnknownError,
  CoreValidationError,
  CoreError,
} from './CoreErrors';

/**
 * Service for searching academic papers via the CORE Research API.
 * 
 * This service is responsible for:
 * - Authenticating with CORE API
 * - Searching the academic corpus
 * - Normalizing responses
 * - Handling pagination
 * - Implementing rate limiting with exponential backoff
 * - Producing deterministic errors
 * 
 * It does NOT:
 * - Perform similarity analysis
 * - Calculate plagiarism scores
 * - Generate AI reasoning
 * - Create PDFs
 */
export class CoreSearchService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly normalizer: CoreNormalizer;
  private readonly maxRetries: number;
  private readonly retryDelays: number[];

  constructor() {
    this.apiKey = process.env.CORE_API_KEY || '';
    this.baseUrl = 'https://api.core.ac.uk/v3';
    this.normalizer = new CoreNormalizer();
    this.maxRetries = 3;
    this.retryDelays = [500, 1000, 2000]; // Exponential backoff: 500ms, 1000ms, 2000ms
  }

  /**
   * Searches the CORE academic corpus for papers.
   * 
   * @param query - Search query string
   * @param options - Optional search parameters (page, limit)
   * @returns Normalized search results
   * @throws CoreValidationError if query is invalid
   * @throws CoreAuthenticationError if API key is missing or invalid
   * @throws CoreNetworkError if network request fails
   * @throws CoreRateLimitError if rate limit is exceeded
   * @throws CoreServerError if server returns 5xx error
   * @throws CoreTimeoutError if request times out
   * @throws CoreUnknownError for unexpected errors
   */
  async search(query: string, options?: CoreSearchOptions): Promise<CoreSearchResult> {
    const startTime = Date.now();

    // Validate query
    this.validateQuery(query);

    // Normalize options
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));

    // Attempt request with retries
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        Logger.searchStarted({ query });
        const rawResponse = await this.executeSearch(query, page, limit);
        const executionTime = Date.now() - startTime;

        // Log minimal information (never log API keys)
        Logger.searchCompleted({
          query,
          durationMs: executionTime,
          resultsCount: rawResponse.totalHits
        });

        return this.normalizer.normalizeResponse(rawResponse, query, page, limit, executionTime);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          throw lastError;
        }

        // If not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          const delay = this.retryDelays[attempt] ?? this.retryDelays[this.retryDelays.length - 1];
          Logger.retry({
            attempt: attempt + 1,
            delayMs: delay
          });
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    Logger.failure({ error: lastError instanceof Error ? lastError.message : String(lastError) });
    throw lastError instanceof CoreError
      ? lastError
      : new CoreUnknownError(`Failed after ${this.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Validates the search query.
   * 
   * @param query - Query string to validate
   * @throws CoreValidationError if query is invalid
   */
  private validateQuery(query: string): void {
    if (!query || typeof query !== 'string') {
      throw new CoreValidationError('Query cannot be empty');
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      throw new CoreValidationError('Query cannot contain only whitespace');
    }

    if (trimmedQuery.length < 3) {
      throw new CoreValidationError('Query must be at least 3 characters long');
    }
  }

  /**
   * Executes the actual search request to CORE API.
   * 
   * @param query - Search query
   * @param page - Page number
   * @param limit - Results per page
   * @returns Raw response from CORE API
   * @throws Various CoreError subclasses based on response
   */
  private async executeSearch(query: string, page: number, limit: number): Promise<CoreRawResponse> {
    if (!this.apiKey) {
      throw new CoreAuthenticationError('CORE_API_KEY is not configured');
    }

    const encodedQuery = encodeURIComponent(query);
    const offset = (page - 1) * limit;
    const url = `${this.baseUrl}/search/works?q=${encodedQuery}&limit=${limit}&offset=${offset}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP status codes
      if (!response.ok) {
        return this.handleErrorResponse(response);
      }

      const data = await response.json();
      return this.parseRawResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new CoreTimeoutError('Request timed out after 30 seconds');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new CoreNetworkError('Failed to connect to CORE API');
      }

      throw new CoreUnknownError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parses raw API response into CoreRawResponse format.
   * 
   * @param data - Raw JSON response
   * @returns Parsed CoreRawResponse
   */
  private parseRawResponse(data: unknown): CoreRawResponse {
    const safeData = (data && typeof data === 'object') ? data as Record<string, unknown> : {};
    return {
      totalHits: typeof safeData.totalHits === 'number' ? safeData.totalHits : 0,
      results: Array.isArray(safeData.results) ? safeData.results as CoreRawResponse['results'] : [],
    };
  }

  /**
   * Handles HTTP error responses from CORE API.
   * 
   * @param response - Fetch response object
   * @throws Appropriate CoreError subclass
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const statusCode = response.status;
    let errorMessage = `CORE API error: ${statusCode}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    switch (statusCode) {
      case 401:
      case 403:
        throw new CoreAuthenticationError(errorMessage, statusCode);

      case 429:
        throw new CoreRateLimitError(errorMessage, statusCode);

      case 500:
      case 502:
      case 503:
      case 504:
        throw new CoreServerError(errorMessage, statusCode);

      case 408:
        throw new CoreTimeoutError(errorMessage);

      default:
        throw new CoreUnknownError(`${errorMessage} (Status: ${statusCode})`);
    }
  }

  /**
   * Determines if an error is retryable.
   * 
   * @param error - Error to check
   * @returns true if error should trigger a retry
   */
  private isRetryableError(error: Error): boolean {
    if (error instanceof CoreError) {
      return error.retryable;
    }

    // Retry network errors and timeouts
    if (error instanceof CoreNetworkError || error instanceof CoreTimeoutError) {
      return true;
    }

    // Don't retry validation or authentication errors
    if (error instanceof CoreValidationError || error instanceof CoreAuthenticationError) {
      return false;
    }

    // Default: don't retry unknown errors
    return false;
  }

  /**
   * Utility function to pause execution.
   * 
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Re-export types for convenience
export type { CoreSearchResult, CoreSearchOptions, CorePaper } from './CoreTypes';
export {
  CoreError,
  CoreAuthenticationError,
  CoreNetworkError,
  CoreRateLimitError,
  CoreServerError,
  CoreTimeoutError,
  CoreUnknownError,
  CoreValidationError,
} from './CoreErrors';
