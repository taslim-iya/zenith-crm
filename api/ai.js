const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { messages, model, temperature, max_tokens } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });

  const key = OPENAI_KEY;
  if (!key) return res.status(500).json({ error: 'No API key configured' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: model || 'gpt-4o', messages, temperature: temperature || 0.3, max_tokens: max_tokens || 4000 }),
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
};
