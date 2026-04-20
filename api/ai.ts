import type { VercelRequest, VercelResponse } from '@vercel/node';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });

  const key = OPENAI_KEY;
  if (!key) return res.status(500).json({ error: 'No API key configured' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: 'gpt-4o', messages, temperature: 0.3, max_tokens: 4000 }),
    });
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
