import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface JwtPayloadLike {
  sub: string;
  email: string;
}

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }
  const userId = email;
  const token = jwt.sign({ sub: userId, email } as JwtPayloadLike, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token });
});

authRouter.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer token' });
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayloadLike;
    return res.json({ id: payload.sub, email: payload.email });
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
});


