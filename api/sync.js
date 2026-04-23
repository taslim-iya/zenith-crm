const SB_URL = 'https://ankwzeyreaisahdubwlt.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = 'cetac';
const FILE = 'zenith-state.json';

module.exports = async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (!SB_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set' });

    const headers = {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
    };

    if (req.method === 'GET') {
      const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + FILE, { headers });
      if (!r.ok) {
        const txt = await r.text();
        return res.json({ state: null, debug: { status: r.status, body: txt.slice(0, 200) } });
      }
      const state = await r.json();
      return res.json({ state });
    }

    if (req.method === 'POST') {
      const body = JSON.stringify(req.body);
      const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + FILE, {
        method: 'PUT',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
        body: body,
      });
      if (!r.ok) {
        const r2 = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + FILE, {
          method: 'POST',
          headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
          body: body,
        });
        if (!r2.ok) {
          const err = await r2.text();
          return res.status(500).json({ error: err });
        }
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e), stack: e.stack });
  }
};
