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
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>CareNest</h1>
      <p>Welcome to CareNest. The frontend is up.</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}


