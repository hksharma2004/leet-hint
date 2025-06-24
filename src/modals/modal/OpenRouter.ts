import { createOpenRouter } from '@/lib/openrouter';

export class OpenRouterModal {
  name = 'openrouter';
  private apiKey: string = '';

  // Initialize with API key
  init(apiKey: string) {
    if (!this.validateApiKey(apiKey)) {
      throw new Error('Invalid OpenRouter API key format');
    }
    this.apiKey = apiKey;
    localStorage.setItem('openrouter_api_key', apiKey);
  }

  // Validate API key format (starts with sk-or-v1-)
  private validateApiKey(key: string): boolean {
    return key.startsWith('sk-or-v1-');
  }

  // Generate a response from OpenRouter
  async generateResponse({
    messages,
    model,
  }: {
    messages: { role: string; content: string }[];
    model: string;
  }) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not initialized');
    }

    try {
      const openrouter = createOpenRouter({ apiKey: this.apiKey });
      const response = await openrouter.chat({
        model,
        messages,
      });
      return {
        error: null,
        success: response,
      };
    } catch (error: any) {
      return { error, success: null };
    }
  }
}
