import { Router } from 'express';
import { broadcast } from '../ws';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const payload = { status: 'healthy', timestamp: new Date().toISOString() };
  res.json(payload);
});

healthRouter.post('/broadcast', (req, res) => {
  const { type = 'health_update', payload = { status: 'ok' } } = req.body as { type?: string; payload?: unknown };
  broadcast(type, payload);
  res.json({ ok: true });
});


