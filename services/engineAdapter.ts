
import { Engine, ScanResult } from '../types';

export interface EngineAdapter {
  id: Engine;
  name: string;
  isProxy: boolean;
  scan(query: string, apiKey?: string, isManaged?: boolean): Promise<Partial<ScanResult>>;
}

export class EngineConnector {
  private static adapters: Record<Engine, EngineAdapter> = {
    [Engine.CHATGPT]: {
      id: Engine.CHATGPT,
      name: 'ChatGPT',
      isProxy: false,
      async scan(query: string, apiKey?: string, isManaged: boolean = true) {
        // Business logic: isManaged means we use the platform's credits and infra
        console.debug(`Scanning ${query} on ChatGPT (Mode: ${isManaged ? 'Managed' : 'Direct'})`);
        return { score: 75, mention_present: true, citation_present: true, sentiment: 'positive' };
      }
    },
    [Engine.CLAUDE]: {
      id: Engine.CLAUDE,
      name: 'Claude',
      isProxy: false,
      async scan(query: string, apiKey?: string, isManaged: boolean = true) {
        return { score: 60, mention_present: true, citation_present: false, sentiment: 'neutral' };
      }
    },
    [Engine.GEMINI]: {
      id: Engine.GEMINI,
      name: 'Gemini',
      isProxy: false,
      async scan(query: string, apiKey?: string, isManaged: boolean = true) {
        return { score: 85, mention_present: true, citation_present: true, sentiment: 'positive' };
      }
    },
    [Engine.PERPLEXITY]: {
      id: Engine.PERPLEXITY,
      name: 'Perplexity',
      isProxy: false,
      async scan(query: string, apiKey?: string, isManaged: boolean = true) {
        return { score: 90, mention_present: true, citation_present: true, sentiment: 'positive' };
      }
    },
    [Engine.COPILOT]: {
      id: Engine.COPILOT,
      name: 'Copilot/Bing',
      isProxy: true,
      async scan(query: string, apiKey?: string, isManaged: boolean = true) {
        return { score: 50, mention_present: false, citation_present: true, sentiment: 'neutral' };
      }
    }
  };

  /**
   * Runs a scan for a specific engine.
   * @param engine The AI engine to scan
   * @param query The user's query
   * @param mode Whether to use 'managed' credits or 'direct' API keys
   * @param apiKey Optional custom API key if in 'direct' mode
   */
  static async runScan(engine: Engine, query: string, mode: 'managed' | 'direct' = 'managed', apiKey?: string) {
    const adapter = this.adapters[engine];
    
    if (mode === 'direct' && !apiKey && !adapter.isProxy) {
      throw new Error(`Connection Error: API key missing for ${adapter.name}. Please connect it in Settings.`);
    }

    return adapter.scan(query, apiKey, mode === 'managed');
  }
}
