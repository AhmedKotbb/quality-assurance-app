import { z } from 'zod';
import { NarrationMode } from '../common/enums';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive(),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  NARRATION_MODE: z.enum([NarrationMode.TEMPLATE, NarrationMode.LLM]),
  LLM_API_KEY: z.string(),
  LLM_BASE_URL: z.url(),
  LLM_MODEL: z.string().min(1),
  MARGIN_PCT: z.coerce.number().positive(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return parsed.data;
}
