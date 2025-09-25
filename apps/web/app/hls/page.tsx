export default function HlsPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32 }}>HLS Player</h1>
      <p><a href="/">Back</a></p>
      <ClientHls />
    </main>
  );
}

function ClientHls() {
  if (typeof window === 'undefined') return null as any;
  const React = require('react') as typeof import('react');
  const [camId, setCamId] = React.useState('cam1');
  const [m3u8, setM3u8] = React.useState<string | null>(null);
  const base = (process.env.NEXT_PUBLIC_ENTERPRISE_URL || 'http://localhost:5000').replace(/\/$/, '');

  const fetchHls = async () => {
    try {
      const res = await fetch(`${base}/api/camera/${encodeURIComponent(camId)}/hls`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.m3u8) setM3u8(base + data.m3u8);
    } catch {}
  };

  return (
    <section>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={camId} onChange={(e: any) => setCamId(e.target.value)} placeholder="cam id" style={{ fontSize: 16, padding: 8 }} />
        <button onClick={fetchHls} style={{ fontSize: 16, padding: '8px 12px' }}>Get Stream URL</button>
      </div>
      {m3u8 ? (
        <video
          controls
          style={{ marginTop: 12, width: '100%', maxWidth: 720, background: '#111' }}
          src={m3u8}
        />
      ) : (
        <div style={{ opacity: 0.8, marginTop: 8 }}>HLS not ready.</div>
      )}
    </section>
  );
}


