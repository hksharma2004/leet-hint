export const VALID_MODELS = [
  // ...existing models...
  {
    name: 'openrouter',
    display: 'OpenRouter (Multiple LLMs)',
    model: 'openrouter/model-id', // Replace with actual model id or allow user to select
    provider: 'OpenRouter',
    description: 'Access multiple LLMs via OpenRouter API',
  },
];

export const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3-0324:free';
export const OPENROUTER_API_KEY: string | undefined = undefined;
