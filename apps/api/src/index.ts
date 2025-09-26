import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import client from 'prom-client';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { alertsRouter } from './routes/alerts';
import { config } from './config';
import { usersRouter } from './routes/users';
import { aiRouter } from './routes/ai';
import { messagesRouter } from './routes/messages';
import { requireAuth } from './routes/auth';
import { prisma } from '@carenest/db';

const app = express();
const server = http.createServer(app);
const port = config.port;
import { setupWebSocket } from './ws';
import rateLimit from 'express-rate-limit';

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", 'data:'],
      "object-src": ["'none'"],
      "script-src": ["'self'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false,
}));
const alertsLimiter = rateLimit({ windowMs: config.rateLimit.windowMs, max: config.rateLimit.max });
app.set('trust proxy', config.trustProxy);
app.use(cors({ origin: config.corsOrigin || true }));
app.use(express.json({ limit: config.jsonLimit }));
app.use(morgan('dev', {
  skip: (req) => {
    const h = Object.keys(req.headers).join(',');
    return h.includes('authorization');
  }
}));

// Audit logging middleware (best-effort; ignores errors if db not ready)
app.use(async (req, _res, next) => {
  try {
    // only log mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const actorId = (req as any).auth?.userId || 'anonymous';
      await prisma.auditLog.create({
        data: {
          actorId,
          action: `${req.method} ${req.path}`.slice(0, 128),
          resource: 'api',
          meta: { ip: req.ip } as any,
        }
      }).catch(() => {});
    }
  } catch {}
  next();
});

// Prometheus metrics
client.collectDefaultMetrics();
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
  } catch (e) {
    res.status(500).send('metrics error');
  }
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', requireAuth(['admin']), usersRouter);
app.use('/alerts', alertsLimiter, alertsRouter);
app.use('/ai', aiRouter);
app.use('/messages', messagesRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'CareNest API', status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

setupWebSocket(server);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CareNest API listening on http://localhost:${port} (env: ${config.nodeEnv})`);
});


