import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { alertsRouter } from './routes/alerts';
import { config } from './config';
import { usersRouter } from './routes/users';
import { aiRouter } from './routes/ai';

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
const alertsLimiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use(cors());
app.use(express.json());
app.use(morgan('dev', {
  skip: (req) => {
    const h = Object.keys(req.headers).join(',');
    return h.includes('authorization');
  }
}));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/alerts', alertsLimiter, alertsRouter);
app.use('/ai', aiRouter);

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


