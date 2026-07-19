export interface NvidiaConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface ApiKeyConfig {
  apiKey: string;
}

export interface DefaultsConfig {
  timeoutMs: number;
  retries: number;
  provider: string;
}

export interface AIConfig {
  core: ApiKeyConfig;
  gemini: ApiKeyConfig;
  nvidia: NvidiaConfig;
  defaults: DefaultsConfig;
}