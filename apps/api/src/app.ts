import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { apiV1Router } from "./routes";
import { logger } from "./lib/logger";

/**
 * Creates and configures the Express application with production rate-limiting and headers.
 */
export function createApp(): Application {
  const app = express();

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin:
        env.NODE_ENV === "production"
          ? process.env["ALLOWED_ORIGINS"]?.split(",") ?? []
          : "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      exposedHeaders: ["X-Request-ID"],
    })
  );

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests from this IP. Please try again in 15 minutes.",
      },
    },
  });
  app.use(limiter);

  // ── Request parsing ───────────────────────────────────────────────────────
  app.use(express.json({ limit: "15mb" })); // Increase JSON limit to support large rows array confirm
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // ── Request tracing ───────────────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── Request logging ───────────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          requestId: req.id,
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: Date.now() - start,
        },
        "Request completed"
      );
    });
    next();
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use("/api/v1", apiV1Router);

  // ── 404 handler (must come after routes) ─────────────────────────────────
  app.use(notFoundHandler);

  // ── Central error handler (must be last, 4-param signature) ──────────────
  app.use(errorHandler);

  return app;
}
