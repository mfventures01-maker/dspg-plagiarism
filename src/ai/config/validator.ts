import { AIConfigError } from './AIConfigError';

const requiredVars: { key: keyof typeof import('./env').env; name: string }[] = [
  { key: 'CORE_API_KEY', name: 'CORE_API_KEY' },
  { key: 'GEMINI_API_KEY', name: 'GEMINI_API_KEY' },
  { key: 'NVIDIA_API_KEY', name: 'NVIDIA_API_KEY' },
  { key: 'NVIDIA_MODEL', name: 'NVIDIA_MODEL' },
  { key: 'NVIDIA_NIM_BASE_URL', name: 'NVIDIA_NIM_BASE_URL' },
];

export function validateRequired(vars: typeof import('./env').env): void {
  for (const { key, name } of requiredVars) {
    if (!vars[key] || vars[key].trim() === '') {
      throw new AIConfigError(`Missing required environment variable: ${name}`);
    }
  }
}

export function validateUrl(url: string, name: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new AIConfigError(`${name} must be a valid HTTPS URL`);
    }
  } catch {
    throw new AIConfigError(`${name} is not a valid URL`);
  }
}

export function validatePositiveInt(value: string | undefined, name: string, defaultVal: number): number {
  if (value === undefined || value === '') {
    return defaultVal;
  }
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    throw new AIConfigError(`${name} must be a positive integer`);
  }
  return num;
}