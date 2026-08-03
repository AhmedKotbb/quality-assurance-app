import { NarrationMode } from '../common/enums';

export default () => ({
  port: Number(process.env.PORT),
  database: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  narrationMode: (process.env.NARRATION_MODE ??
    NarrationMode.TEMPLATE) as NarrationMode,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
  },
  marginPct: parseFloat(process.env.MARGIN_PCT!),
});
