import { z } from 'zod';

export const envSchema = z.object({
  DB_CONNECTION_STRING: z.string(),
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string(),
  JWT_REFRESH_EXPIRES: z.string(),
  COOKIE_SECRET: z.string(),
  NODE_ENV: z.string().refine((v) => v === 'production' || 'development'),
  REDIS_URL: z.string(),
  CLIENT_URL: z.string(),
  ACCESS_COOKIE_MAX_AGE: z.coerce.number(),
  REFRESH_COOKIE_MAX_AGE: z.coerce.number(),
  REFRESH_REDIS_MAX_AGE: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_PROJECT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_REDIRECT_URL: z.string(),
  CLOUDINARY_API_KEY: z.coerce.number(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_FOLDER: z.string(),
  MULTER_DEST: z.string(),
});

export type Env = z.infer<typeof envSchema>;
