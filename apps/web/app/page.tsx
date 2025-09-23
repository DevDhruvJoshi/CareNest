async function fetchHealth() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/health`, { cache: 'no-store' });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e: unknown) {
    return { error: 'API not reachable' };
  }
}

export default async function HomePage() {
  const health = await fetchHealth();
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 36 }}>કેરનેસ્ટ (CareNest)</h1>
      <p style={{ fontSize: 20 }}>સિસ્ટમ ચાલુ છે. રિયલ-ટાઇમ હેલ્થ અપડેટ્સ નીચે દેખાશે.</p>
      <HealthPanel initial={health} />
      <AnalyticsAndSnapshot />
      <LiveVideo />
      <AlertsTimeline />
    </main>
  );
}

function HealthPanel({ initial }: { initial: unknown }) {
  // Client-only widget via simple no-SSR dynamic
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? (
        <pre>{JSON.stringify(initial, null, 2)}</pre>
      ) : (
        <LiveHealth initial={initial} />
      )}
    </div>
  );
}

function AlertsTimeline() {
  if (typeof window === 'undefined') return null as any;
  const React = require('react') as typeof import('react');
  const [items, setItems] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<string | undefined>(undefined);
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  const readToken = process.env.NEXT_PUBLIC_READ_TOKEN;

  const load = async () => {
    try {
      const url = new URL(base + '/alerts/events');
      if (cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url.toString(), { headers: readToken ? { 'x-read-token': readToken } : {} as any });
      const data = await res.json();
      if (data?.items) {
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
      }
    } catch {}
  };

  React.useEffect(() => { load(); }, []);

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 28 }}>ઇવેન્ટ્સ</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((e) => (
          <div key={e.id} style={{ background: '#111', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 16 }}>{e.type} — {e.cameraId}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(e.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      {cursor && (
        <button onClick={load} style={{ marginTop: 12, fontSize: 16, padding: '8px 12px' }}>વધુ લોડ કરો</button>
      )}
    </section>
  );
}

function LiveHealth({ initial }: { initial: any }) {
  const [state, setState] = (require('react') as typeof import('react')).useState<any>(initial);
  (require('react') as typeof import('react')).useEffect(() => {
    const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '') + '/ws';
    const ws = new (window as any).WebSocket(url);
    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'health_update' || msg?.type === 'hello') {
          setState((s: any) => ({ ...s, lastEvent: msg }));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);
  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 28 }}>હેલ્થ સ્ટેટસ</h2>
      <pre style={{ fontSize: 16, background: '#111', padding: 12, borderRadius: 8 }}>{JSON.stringify(state, null, 2)}</pre>
    </section>
  );
}

function AnalyticsAndSnapshot() {
  if (typeof window === 'undefined') return null as any;
  const React = require('react') as typeof import('react');
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [camId, setCamId] = React.useState('cam1');
  const [rtspUrl, setRtspUrl] = React.useState('rtsp://example');
  const base = (process.env.NEXT_PUBLIC_ENTERPRISE_URL || 'http://localhost:5000').replace(/\/$/, '');

  const startCam = async () => {
    await fetch(`${base}/api/camera/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: camId, url: rtspUrl })
    }).catch(() => {});
  };
  const loadAnalytics = async () => {
    try {
      const res = await fetch(`${base}/api/health-analytics`, { cache: 'no-store' });
      setAnalytics(await res.json());
    } catch {}
  };

  React.useEffect(() => {
    const t = setInterval(loadAnalytics, 5000);
    loadAnalytics();
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 28 }}>કેમેરા અને એનાલિટિક્સ</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={camId} onChange={(e: any) => setCamId(e.target.value)} placeholder="cam id" style={{ fontSize: 16, padding: 8 }} />
        <input value={rtspUrl} onChange={(e: any) => setRtspUrl(e.target.value)} placeholder="rtsp url" style={{ fontSize: 16, padding: 8, minWidth: 320 }} />
        <button onClick={startCam} style={{ fontSize: 16, padding: '8px 12px' }}>શરૂ કરો</button>
        <a href={`${base}/api/camera/${encodeURIComponent(camId)}/snapshot`} target="_blank" rel="noreferrer" style={{ color: '#0bf' }}>સ્નેપશોટ જુઓ</a>
      </div>
      <pre style={{ fontSize: 16, background: '#111', padding: 12, borderRadius: 8, marginTop: 12 }}>{JSON.stringify(analytics, null, 2)}</pre>
    </section>
  );
}


function LiveVideo() {
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
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 28 }}>લાઇવ વિડિયો</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input value={camId} onChange={(e: any) => setCamId(e.target.value)} placeholder="cam id" style={{ fontSize: 16, padding: 8 }} />
        <button onClick={fetchHls} style={{ fontSize: 16, padding: '8px 12px' }}>સ્ટ્રીમ URL મેળવો</button>
      </div>
      {m3u8 ? (
        <video
          controls
          style={{ marginTop: 12, width: '100%', maxWidth: 720, background: '#111' }}
          src={m3u8}
        />
      ) : (
        <div style={{ opacity: 0.8, marginTop: 8 }}>HLS તૈયાર નથી.</div>
      )}
    </section>
  );
}


