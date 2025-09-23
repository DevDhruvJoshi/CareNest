import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { config } from './config';

const app = express();
const port = config.port;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/health', healthRouter);
app.use('/auth', authRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'CareNest API', status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CareNest API listening on http://localhost:${port} (env: ${config.nodeEnv})`);
});


