import pino from "pino";
import { env } from "../config/env";

/**
 * Singleton Pino logger.
 *
 * In development, output is pretty-printed via pino-pretty.
 * In production, output is newline-delimited JSON suitable for log aggregators.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
    : {
        // Production: structured JSON with timestamp
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

export type Logger = typeof logger;
