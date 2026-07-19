// This is the ONLY file allowed to access process.env directly
export const env = {
  CORE_API_KEY: process.env.CORE_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  NVIDIA_MODEL: process.env.NVIDIA_MODEL,
  NVIDIA_NIM_BASE_URL: process.env.NVIDIA_NIM_BASE_URL,
  AI_TIMEOUT_MS: process.env.AI_TIMEOUT_MS,
  AI_MAX_RETRIES: process.env.AI_MAX_RETRIES,
  AI_DEFAULT_PROVIDER: process.env.AI_DEFAULT_PROVIDER,
  AI_LOG_LEVEL: process.env.AI_LOG_LEVEL,
};