import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { config } from './config';
import { usersRouter } from './routes/users';

const app = express();
const server = http.createServer(app);
const port = config.port;
import { setupWebSocket } from './ws';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

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


