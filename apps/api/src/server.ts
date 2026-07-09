/**
 * Server entry point.
 *
 * Loads environment variables before anything else is imported so that
 * config/env.ts can validate them at module evaluation time.
 */
import "dotenv/config";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { getLLMProvider } from "./providers/llm/factory";

async function bootstrap(): Promise<void> {
  // Eagerly initialise the LLM provider — fail fast if the API key is missing
  getLLMProvider();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        llmProvider: env.LLM_PROVIDER,
      },
      `🚀 API server listening on http://localhost:${env.PORT}`
    );
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  function shutdown(signal: string): void {
    logger.info({ signal }, "Shutdown signal received, closing server…");
    server.close(() => {
      logger.info("HTTP server closed. Exiting.");
      process.exit(0);
    });

    // Force exit if server hasn't closed within 10 seconds
    setTimeout(() => {
      logger.error("Forceful shutdown after timeout.");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception — shutting down");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ reason }, "Unhandled promise rejection — shutting down");
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
