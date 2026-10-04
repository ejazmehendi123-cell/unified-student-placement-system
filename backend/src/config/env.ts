import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  SUPABASE_URL: z.string().default('https://frhqfyrrjliekxkuiuxm.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock_key_for_development'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  JWT_SECRET: z.string().default('usps-super-secure-jwt-secret-key-production-2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  STORAGE_DIR: z.string().default('./uploads'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    return envSchema.parse({});
  }
  return result.data;
};

export const env = parseEnv();
