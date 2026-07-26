import { AIError } from '../errors/AIErrors';

export interface AIResponse {
  success: boolean;
  provider: string;
  model: string;
  durationMs: number;
  data?: any;
  error?: AIError;
}
