import { NextFunction, Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface JwtPayloadLike {
  sub: string;
  email: string;
}

export const authRouter = Router();

// RBAC-ready auth middleware scaffold
export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export function requireAuth(requiredRoles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer token' });
    const token = auth.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email: string; roles?: string[] };
      const roles = Array.isArray(payload.roles) ? payload.roles : [];
      req.auth = { userId: payload.sub, email: payload.email, roles };
      if (requiredRoles && requiredRoles.length > 0) {
        const has = requiredRoles.some((r) => roles.includes(r));
        if (!has) return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  };
}

authRouter.post('/login', (req, res) => {
  const { email, roles } = req.body as { email?: string; roles?: string[] };
  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }
  const userId = email;
  const token = jwt.sign({ sub: userId, email, roles: Array.isArray(roles) ? roles : [] } as any, config.jwtSecret, { expiresIn: '7d' });
  res.json({ token });
});

authRouter.get('/me', requireAuth(), (req, res) => {
  return res.json({ id: req.auth!.userId, email: req.auth!.email, roles: req.auth!.roles });
});


