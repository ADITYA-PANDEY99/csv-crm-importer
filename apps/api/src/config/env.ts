import { z } from "zod";

/**
 * Validated environment configuration for the API server.
 *
 * Validation runs once at process start. A failed schema will throw,
 * terminating the process before it can serve malformed requests.
 */
const EnvSchema = z.object({
  // ── Server ────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // ── LLM Provider ─────────────────────────────────────────────────────────
  LLM_PROVIDER: z.enum(["openai", "gemini"]).default("openai"),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o"),

  // Gemini
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-pro"),

  // ── Upload ────────────────────────────────────────────────────────────────
  /** Maximum upload size in bytes (default: 10 MB) */
  MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(10_485_760),
  /** Comma-separated list of allowed MIME types */
  ALLOWED_MIME_TYPES: z
    .string()
    .default("text/csv,application/vnd.ms-excel,text/plain"),
});

function validateEnv(): z.infer<typeof EnvSchema> {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
export type Env = typeof env;
