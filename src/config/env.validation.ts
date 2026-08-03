import { z } from 'zod';
import { NarrationMode } from '../common/enums';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_HOST: z.string().min(1).default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USER: z.string().min(1).default('qa'),
  DATABASE_PASSWORD: z.string().min(1).default('qa'),
  DATABASE_NAME: z.string().min(1).default('qa_cement'),
  NARRATION_MODE: z
    .enum([NarrationMode.TEMPLATE, NarrationMode.LLM])
    .default(NarrationMode.TEMPLATE),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
  MARGIN_PCT: z.coerce.number().positive().default(5),
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
