import { z } from "zod";

/**
 * Validated public environment variables for the Next.js frontend.
 *
 * Only NEXT_PUBLIC_* variables are accessible on the client. Validation runs
 * at module evaluation time so a misconfigured deployment fails loudly.
 */
const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:3001"),
});

function validateClientEnv(): z.infer<typeof ClientEnvSchema> {
  const parsed = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env["NEXT_PUBLIC_API_URL"],
  });

  if (!parsed.success) {
    throw new Error(
      `❌ Invalid client environment:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
    );
  }

  return parsed.data;
}

export const clientEnv = validateClientEnv();
