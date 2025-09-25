export default function AlertsPage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32 }}>Alerts & Events</h1>
      <p><a href="/">Back</a></p>
      <ClientAlerts />
    </main>
  );
}

function ClientAlerts() {
  if (typeof window === 'undefined') return null as any;
  const React = require('react') as typeof import('react');
  const [items, setItems] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<string | undefined>();
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
    <section>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((e) => (
          <div key={e.id} style={{ background: '#111', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 16 }}>{e.type} — {e.cameraId}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(e.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
      {cursor && (
        <button onClick={load} style={{ marginTop: 12, fontSize: 16, padding: '8px 12px' }}>Load more</button>
      )}
    </section>
  );
}


