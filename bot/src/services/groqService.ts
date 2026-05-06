import { env } from '../config/env';

export type GroqChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function groqChatComplete(input: {
  messages: GroqChatMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error('[Groq] GROQ_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutMs = input.timeoutMs ?? 8000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages: input.messages,
        temperature: input.temperature ?? 0.8,
        max_tokens: input.maxTokens ?? 140,
      }),
      signal: controller.signal,
    });

    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`[Groq] HTTP ${res.status}: ${text || res.statusText}`);
    }

    const data = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('[Groq] Empty response');
    return content.trim();
  } finally {
    clearTimeout(t);
  }
}

