import { Router } from 'express';
import { sendAlert } from '../services/alerts';
import { prisma } from '@carenest/db';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Router as ExpressRouter } from 'express';

export const alertsRouter = Router();

alertsRouter.post('/', async (req, res) => {
  const { subject, message, to, channel } = req.body as {
    subject?: string;
    message?: string;
    to?: string;
    channel?: 'sms' | 'email' | 'call' | 'log';
  };
  if (!message) return res.status(400).json({ error: 'message required' });
  const result = await sendAlert({ subject, message, to, channel });
  res.json(result);
});

alertsRouter.get('/', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer token' });
  try {
    jwt.verify(auth.slice('Bearer '.length), config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
  const take = Math.min(Number(req.query.take || 20), 100);
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const where: any = {};
  if (req.query.channel) where.channel = String(req.query.channel);
  if (req.query.to) where.to = String(req.query.to);
  const alerts = await prisma.alert.findMany({
    where,
    take: take + 1,
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const nextCursor = alerts.length > take ? alerts.pop()?.id : undefined;
  res.json({ items: alerts, nextCursor });
});

// Camera events ingest (protected via ingest token)
alertsRouter.post('/events', async (req, res) => {
  const token = req.headers['x-ingest-token'];
  if (!token || token !== process.env.INGEST_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { cameraId, type, details } = req.body as { cameraId?: string; type?: string; details?: unknown };
  if (!cameraId || !type) return res.status(400).json({ error: 'cameraId and type required' });
  const ev = await prisma.cameraEvent.create({ data: { cameraId, type, details: (details as any) || undefined } });
  return res.status(201).json(ev);
});

// List camera events (guarded with JWT or read token)
alertsRouter.get('/events', async (req, res) => {
  const readToken = req.headers['x-read-token'];
  const auth = req.headers.authorization;
  const okByToken = readToken && readToken === process.env.READ_TOKEN;
  let okByJwt = false;
  if (auth?.startsWith('Bearer ')) {
    try {
      jwt.verify(auth.slice('Bearer '.length), config.jwtSecret);
      okByJwt = true;
    } catch {}
  }
  if (!okByToken && !okByJwt) return res.status(401).json({ error: 'unauthorized' });
  const take = Math.min(Number(req.query.take || 50), 200);
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const where: any = {};
  if (req.query.cameraId) where.cameraId = String(req.query.cameraId);
  if (req.query.type) where.type = String(req.query.type);
  const events = await prisma.cameraEvent.findMany({
    where,
    take: take + 1,
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const nextCursor = events.length > take ? events.pop()?.id : undefined;
  res.json({ items: events, nextCursor });
});



