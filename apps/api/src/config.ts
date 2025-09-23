import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
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
};


