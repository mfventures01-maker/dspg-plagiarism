import { env } from './env';
import { validateRequired, validateUrl, validatePositiveInt } from './validator';
import type { AIConfig as AIConfigType } from './types';
import { AIConfigError } from './AIConfigError';

let configInstance: AIConfigType | null = null;

function initializeConfig(): AIConfigType {
  // Validate required variables first
  validateRequired(env);

  // Validate URL
  if (env.NVIDIA_NIM_BASE_URL) {
    validateUrl(env.NVIDIA_NIM_BASE_URL, 'NVIDIA_NIM_BASE_URL');
  }

  // Parse defaults with validation
  const timeoutMs = validatePositiveInt(env.AI_TIMEOUT_MS, 'AI_TIMEOUT_MS', 30000);
  const retries = validatePositiveInt(env.AI_MAX_RETRIES, 'AI_MAX_RETRIES', 2);
  const provider = env.AI_DEFAULT_PROVIDER?.trim() || 'nvidia';

  const config: AIConfigType = {
    core: {
      apiKey: env.CORE_API_KEY!.trim(),
    },
    gemini: {
      apiKey: env.GEMINI_API_KEY!.trim(),
    },
    nvidia: {
      apiKey: env.NVIDIA_API_KEY!.trim(),
      model: env.NVIDIA_MODEL!.trim(),
      baseUrl: env.NVIDIA_NIM_BASE_URL!.trim(),
    },
    defaults: {
      timeoutMs,
      retries,
      provider,
    },
  };

  // Freeze the configuration to ensure immutability
  Object.freeze(config.defaults);
  Object.freeze(config.core);
  Object.freeze(config.gemini);
  Object.freeze(config.nvidia);
  Object.freeze(config);

  return config;
}

export const AIConfig = {
  get core() {
    if (!configInstance) configInstance = initializeConfig();
    return configInstance.core;
  },
  get gemini() {
    if (!configInstance) configInstance = initializeConfig();
    return configInstance.gemini;
  },
  get nvidia() {
    if (!configInstance) configInstance = initializeConfig();
    return configInstance.nvidia;
  },
  get defaults() {
    if (!configInstance) configInstance = initializeConfig();
    return configInstance.defaults;
  },
  get() {
    if (!configInstance) configInstance = initializeConfig();
    return configInstance;
  },
};