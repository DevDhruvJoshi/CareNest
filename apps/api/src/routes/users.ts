import { Router } from 'express';
import { prisma } from '@carenest/db';

export const usersRouter = Router();

usersRouter.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'failed to list users' });
  }
});

usersRouter.post('/', async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }
  try {
    const user = await prisma.user.create({ data: { email, name } });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'failed to create user' });
  }
});

usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'failed to fetch user' });
  }
});


