import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().optional(),
  RATE_LIMIT_MAX: z.coerce.number().optional(),
  JSON_LIMIT: z.string().optional(),
  TRUST_PROXY: z.union([z.string(), z.coerce.boolean()]).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  // Fail fast in production; allow default JWT in dev to avoid blocking
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    throw new Error('Environment validation failed');
  }
}

export const config = {
  nodeEnv: parsed.success ? parsed.data.NODE_ENV : (process.env.NODE_ENV || 'development'),
  port: parsed.success ? parsed.data.PORT : Number(process.env.PORT || 4000),
  jwtSecret: parsed.success ? parsed.data.JWT_SECRET : (process.env.JWT_SECRET || 'dev-secret'),
  databaseUrl: parsed.success
    ? parsed.data.DATABASE_URL
    : (process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/carenest'),
  corsOrigin: parsed.success ? parsed.data.CORS_ORIGIN : process.env.CORS_ORIGIN,
  rateLimit: {
    windowMs: parsed.success ? (parsed.data.RATE_LIMIT_WINDOW_MS || 60_000) : Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: parsed.success ? (parsed.data.RATE_LIMIT_MAX || 120) : Number(process.env.RATE_LIMIT_MAX || 120),
  },
  jsonLimit: parsed.success ? (parsed.data.JSON_LIMIT || '1mb') : (process.env.JSON_LIMIT || '1mb'),
  trustProxy: parsed.success
    ? (parsed.data.TRUST_PROXY === true || parsed.data.TRUST_PROXY === 'true')
    : (String(process.env.TRUST_PROXY || '').toLowerCase() === 'true'),
};


