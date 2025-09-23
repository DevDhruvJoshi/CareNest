import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

type Client = WebSocket;

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (socket: Client) => {
    socket.send(JSON.stringify({ type: 'hello', message: 'connected' }));

    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg?.type === 'ping') {
          socket.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        }
      } catch {
        // ignore
      }
    });
  });

  // periodic health broadcast
  setInterval(() => {
    const payload = {
      status: 'ok',
      uptimeMs: Math.round(process.uptime() * 1000),
      memory: process.memoryUsage(),
      ts: Date.now(),
    };
    broadcast('health_update', payload);
  }, 5000);
}

export function broadcast(event: string, payload: unknown) {
  if (!wss) return;
  const message = JSON.stringify({ type: event, payload, ts: Date.now() });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}


