import { Router } from 'express';
import { prisma } from '@carenest/db';
import { requireAuth } from './auth';

export const messagesRouter = Router();

messagesRouter.post('/', requireAuth(), async (req, res) => {
  const { to, text } = req.body as { to?: string; text?: string };
  if (!text) return res.status(400).json({ error: 'text required' });
  try {
    const msg = await prisma.message.create({
      data: {
        fromId: req.auth!.userId,
        toId: to || null,
        text,
      }
    }).catch(() => null);
    if (!msg) return res.status(202).json({ accepted: true });
    res.status(201).json(msg);
  } catch {
    res.status(500).json({ error: 'failed to send' });
  }
});

messagesRouter.get('/', requireAuth(), async (req, res) => {
  const take = Math.min(Number(req.query.take || 20), 100);
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const where: any = { OR: [{ toId: req.auth!.userId }, { fromId: req.auth!.userId }] };
  const items = await prisma.message.findMany({
    where,
    take: take + 1,
    orderBy: { createdAt: 'desc' },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  }).catch(() => []);
  const nextCursor = (items.length > take ? items.pop()?.id : undefined);
  res.json({ items, nextCursor });
});





