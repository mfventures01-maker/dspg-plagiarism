/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../interfaces/AIProvider';

export interface RegisteredProvider {
  id: string;
  provider: string;
  model: string;
  priority: number;
  enabled: boolean;
}

export interface ProviderHealth {
  provider: string;
  model: string;
  available: boolean;
  latencyMs: number;
  lastSuccessfulCall?: string;
  lastFailure?: string;
}

interface ProviderEntry {
  metadata: RegisteredProvider;
  instance: AIProvider;
}

/**
 * Single Responsibility: Act as the single source of truth for AI providers.
 * Do NOT perform retries, fallback logic, prompt generation, or business logic.
 */
export class ProviderRegistry {
  private readonly providers: Map<string, ProviderEntry> = new Map();

  /**
   * Registers a provider with its metadata and active instance.
   */
  public register(metadata: RegisteredProvider, instance: AIProvider): void {
    if (this.providers.has(metadata.id)) {
      throw new Error(`Provider with ID '${metadata.id}' is already registered.`);
    }
    this.providers.set(metadata.id, { metadata, instance });
  }

  /**
   * Retrieves the primary (highest priority) enabled provider.
   */
  public getPrimary(): AIProvider | undefined {
    const sorted = this.getSortedEnabled();
    if (sorted.length === 0) return undefined;
    return sorted[0].instance;
  }

  /**
   * Returns all enabled providers except the primary, ordered by priority,
   * for future fallback implementations.
   */
  public getFallbacks(): AIProvider[] {
    const sorted = this.getSortedEnabled();
    if (sorted.length <= 1) return [];
    
    // Return everything except the first (primary)
    return sorted.slice(1).map(p => p.instance);
  }

  /**
   * Retrieves a specific provider by its explicit ID.
   */
  public getProvider(id: string): AIProvider | undefined {
    const entry = this.providers.get(id);
    if (!entry || !entry.metadata.enabled) return undefined;
    return entry.instance;
  }

  /**
   * Returns metadata of all registered providers.
   */
  public listProviders(): RegisteredProvider[] {
    return Array.from(this.providers.values()).map(p => p.metadata);
  }

  private getSortedEnabled(): ProviderEntry[] {
    return Array.from(this.providers.values())
      .filter(p => p.metadata.enabled)
      .sort((a, b) => a.metadata.priority - b.metadata.priority);
  }
}
