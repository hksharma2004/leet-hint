export function createOpenRouter({ apiKey }: { apiKey: string }) {
  return {
    async chat({ model, messages }: { model: string; messages: any[] }) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
      throw new Error(data.error?.message || 'OpenRouter API error');
    }
    console.log('Raw OpenRouter API response:', JSON.stringify(data, null, 2));
    return data;
    },
  };
}
