export interface ProviderConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  enabled: boolean;
  priority: number;
}

export interface DefaultsConfig {
  timeoutMs: number;
  retries: number;
  provider: string;
  maxPayloadBytes: number;
  maxDocuments: number;
}

export interface AIConfigData {
  core: ProviderConfig;
  gemini: ProviderConfig;
  nvidia: ProviderConfig;
  deepseek: ProviderConfig;
  unpaywall: ProviderConfig;
  defaults: DefaultsConfig;
}

let coreInstance: ProviderConfig | null = null;
let geminiInstance: ProviderConfig | null = null;
let nvidiaInstance: ProviderConfig | null = null;
let deepseekInstance: ProviderConfig | null = null;
let defaultsInstance: DefaultsConfig | null = null;

function parsePositiveInt(val: string | undefined, defaultVal: number): number {
  if (!val) return defaultVal;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

function parseBoolean(val: string | undefined, defaultVal: boolean): boolean {
  if (!val) return defaultVal;
  return val.toLowerCase() === 'true';
}

function loadCoreConfig(): ProviderConfig {
  if (coreInstance) return coreInstance;
  const config = {
    apiKey: process.env.CORE_API_KEY || '',
    enabled: parseBoolean(process.env.CORE_PROVIDER_ENABLED, true),
    priority: parsePositiveInt(process.env.CORE_PROVIDER_PRIORITY, 1),
  };
  if (!config.apiKey) throw new Error('Missing CORE_API_KEY');
  coreInstance = Object.freeze(config);
  return coreInstance;
}

function loadGeminiConfig(): ProviderConfig {
  if (geminiInstance) return geminiInstance;
  const config = {
    apiKey: process.env.GEMINI_API_KEY || '',
    enabled: parseBoolean(process.env.GEMINI_PROVIDER_ENABLED, true),
    priority: parsePositiveInt(process.env.GEMINI_PROVIDER_PRIORITY, 2),
  };
  if (!config.apiKey) throw new Error('Missing GEMINI_API_KEY');
  geminiInstance = Object.freeze(config);
  return geminiInstance;
}

function loadNvidiaConfig(): ProviderConfig {
  if (nvidiaInstance) return nvidiaInstance;
  const config = {
    apiKey: process.env.NVIDIA_API_KEY || '',
    model: process.env.NVIDIA_MODEL || '',
    baseUrl: process.env.NVIDIA_NIM_BASE_URL || '',
    enabled: parseBoolean(process.env.NVIDIA_PROVIDER_ENABLED, true),
    priority: parsePositiveInt(process.env.NVIDIA_PROVIDER_PRIORITY, 4),
  };
  if (!config.apiKey) throw new Error('Missing NVIDIA_API_KEY');
  if (!config.model) throw new Error('Missing NVIDIA_MODEL');
  if (!config.baseUrl) throw new Error('Missing NVIDIA_NIM_BASE_URL');
  nvidiaInstance = Object.freeze(config);
  return nvidiaInstance;
}

function loadDeepseekConfig(): ProviderConfig {
  if (deepseekInstance) return deepseekInstance;
  const config = {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    enabled: parseBoolean(process.env.DEEPSEEK_PROVIDER_ENABLED, true),
    priority: parsePositiveInt(process.env.DEEPSEEK_PROVIDER_PRIORITY, 3),
  };
  if (!config.apiKey) throw new Error('Missing DEEPSEEK_API_KEY');
  deepseekInstance = Object.freeze(config);
  return deepseekInstance;
}

function loadDefaultsConfig(): DefaultsConfig {
  if (defaultsInstance) return defaultsInstance;
  const config = {
    timeoutMs: parsePositiveInt(process.env.AI_TIMEOUT_MS, 30000),
    retries: parsePositiveInt(process.env.AI_MAX_RETRIES, 2),
    provider: process.env.AI_DEFAULT_PROVIDER?.trim() || 'nvidia',
    maxPayloadBytes: parsePositiveInt(process.env.AI_MAX_PAYLOAD_BYTES, 1048576),
    maxDocuments: parsePositiveInt(process.env.AI_MAX_DOCUMENTS, 10),
  };
  if (config.timeoutMs <= 0) throw new Error('timeoutMs must be positive');
  if (config.retries < 0) throw new Error('maxRetries cannot be negative');
  defaultsInstance = Object.freeze(config);
  return defaultsInstance;
}

let unpaywallInstance: ProviderConfig | null = null;
const loadUnpaywallConfig = (): ProviderConfig => {
  if (unpaywallInstance) return unpaywallInstance;
  const config = {
    apiKey: process.env.UNPAYWALL_EMAIL || 'user@example.com',
    baseUrl: 'https://api.unpaywall.org/v2',
    enabled: parseBoolean(process.env.UNPAYWALL_PROVIDER_ENABLED, true),
    priority: parsePositiveInt(process.env.UNPAYWALL_PROVIDER_PRIORITY, 2),
  };
  unpaywallInstance = Object.freeze(config);
  return unpaywallInstance;
};

export const AIConfig = {
  get core() {
    return loadCoreConfig();
  },
  get gemini() {
    return loadGeminiConfig();
  },
  get nvidia() {
    return loadNvidiaConfig();
  },
  get deepseek() {
    return loadDeepseekConfig();
  },
  get unpaywall() {
    return loadUnpaywallConfig();
  },
  get defaults() {
    return loadDefaultsConfig();
  },
  get() {
    return {
      get core() { return loadCoreConfig(); },
      get gemini() { return loadGeminiConfig(); },
      get nvidia() { return loadNvidiaConfig(); },
      get deepseek() { return loadDeepseekConfig(); },
      get unpaywall() { return loadUnpaywallConfig(); },
      get defaults() { return loadDefaultsConfig(); }
    } as unknown as AIConfigData;
  }
};