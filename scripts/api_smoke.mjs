// Simple API smoke test using Node 20+ native fetch
// Usage: node scripts/api_smoke.mjs

const API = process.env.API_URL || 'http://localhost:4000';
const INGEST = process.env.INGEST_TOKEN || 'dev-ingest-token';
const READ = process.env.READ_TOKEN || 'dev-read-token';

async function main() {
  const health = await fetch(API + '/health').then(r => r.text()).catch(e => String(e));
  console.log('GET /health ->', health);

  const ev = await fetch(API + '/alerts/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-ingest-token': INGEST },
    body: JSON.stringify({ cameraId: 'smoke', type: 'motion', details: { via: 'api_smoke' } })
  }).then(r => ({ status: r.status, ok: r.ok })).catch(e => ({ error: String(e) }));
  console.log('POST /alerts/events ->', ev);

  const list = await fetch(API + '/alerts/events', {
    headers: { 'x-read-token': READ }
  }).then(r => r.json()).catch(e => ({ error: String(e) }));
  console.log('GET /alerts/events ->', Array.isArray(list.items) ? list.items.length + ' items' : list);
}

main().catch(err => { console.error(err); process.exit(1); });



