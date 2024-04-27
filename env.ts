import { z } from 'zod';

export const envSchema = z.object({
  DB_CONNECTION_STRING: z.string(),
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string(),
  JWT_REFRESH_EXPIRES: z.string(),
  COOKIE_SECRET: z.string(),
  NODE_ENV: z.string(),
  REDIS_URL: z.string(),
  ACCESS_COOKIE_MAX_AGE: z.coerce.number(),
  REFRESH_COOKIE_MAX_AGE: z.coerce.number(),
  REDRES_REDIS_MAX_AGE: z.coerce.number(),
});

export type Env = z.infer<typeof envSchema>;
