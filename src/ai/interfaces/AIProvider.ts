import { AIRequest } from '../types/AIRequest';
import { AIResponse } from '../types/AIResponse';

export interface AIProvider {
  name: string;
  initialize(): Promise<void>;
  healthCheck(): Promise<boolean>;
  analyzeDocument(request: AIRequest): Promise<AIResponse>;
  calculateSimilarity(text1: string, text2: string): Promise<number>;
  detectAI(text: string): Promise<number>;
  shutdown(): Promise<void>;
}
