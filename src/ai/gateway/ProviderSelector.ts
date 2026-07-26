import { AIProvider } from '../interfaces/AIProvider';
import { DeepSeekProvider } from '../providers/DeepSeekProvider';
import { CoreProvider } from '../providers/CoreProvider';
import { GeminiProvider } from '../providers/GeminiProvider';
import { NVIDIAProvider } from '../providers/NVIDIAProvider';
import { AIConfig } from '../config/AIConfig';

export class ProviderSelector {
  private providers = new Map<string, AIProvider>();

  constructor() {
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new DeepSeekProvider());
    this.registerProvider(new NVIDIAProvider());
    this.registerProvider(new CoreProvider());
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  public getProvider(name: string): AIProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Provider '${name}' is not registered.`);
    }
    return provider;
  }

  public selectPrimaryProvider(): AIProvider {
    // RC-004 dictates Gemini becomes Primary.
    return this.getProvider('gemini');
  }

  public selectFallbackProvider(primaryProviderName: string): AIProvider {
    // If Gemini fails, fallback to DeepSeek, then NVIDIA
    if (primaryProviderName.toLowerCase() === 'gemini') {
      return this.getProvider('deepseek');
    }
    if (primaryProviderName.toLowerCase() === 'deepseek') {
      return this.getProvider('nvidia');
    }
    
    // Default fallback
    return this.getProvider('deepseek');
  }
}

