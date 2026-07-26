import { randomUUID } from 'crypto';

export interface LedgerEntry {
  executionId: string;
  institutionId?: string;
  projectId?: string;
  studentId?: string;
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  latencyMs: number;
  retries: number;
  fallbackUsed: boolean;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Retried' | 'Fallback' | 'Cancelled';
  errors?: string[];
  timestamp: string;
}

export class AIExecutionLedger {
  private static instance: AIExecutionLedger;
  private entries: LedgerEntry[] = [];

  private constructor() {}

  public static getInstance(): AIExecutionLedger {
    if (!AIExecutionLedger.instance) {
      AIExecutionLedger.instance = new AIExecutionLedger();
    }
    return AIExecutionLedger.instance;
  }

  public record(entry: Omit<LedgerEntry, 'timestamp'>): void {
    const fullEntry: LedgerEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    // Immutable recording - in a real app this would write to a DB or log stream
    this.entries.push(Object.freeze(fullEntry));
    console.log(`[LEDGER] Execution ${entry.executionId} recorded. Status: ${entry.status}. Provider: ${entry.provider}`);
  }

  public getEntries(): LedgerEntry[] {
    // Return a shallow copy of the immutable entries
    return [...this.entries];
  }
}
