import { Router } from 'express';
import { sendAlert } from '../services/alerts';

export const alertsRouter = Router();

alertsRouter.post('/', async (req, res) => {
  const { subject, message, to, channel } = req.body as {
    subject?: string;
    message?: string;
    to?: string;
    channel?: 'sms' | 'email' | 'log';
  };
  if (!message) return res.status(400).json({ error: 'message required' });
  const result = await sendAlert({ subject, message, to, channel });
  res.json(result);
});



