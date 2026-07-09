import { env } from "../../config/env";
import { logger } from "../../lib/logger";
import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import type { LLMProvider } from "./types";

let _instance: LLMProvider | null = null;

/**
 * Returns the singleton LLM provider selected by the LLM_PROVIDER env var.
 *
 * The provider is instantiated once and cached. Calling this function a
 * second time always returns the same instance.
 *
 * @throws If the required API key for the selected provider is missing.
 */
export function getLLMProvider(): LLMProvider {
  if (_instance) return _instance;

  logger.info(
    { provider: env.LLM_PROVIDER },
    "Initializing LLM provider"
  );

  switch (env.LLM_PROVIDER) {
    case "openai":
      _instance = new OpenAIProvider();
      break;
    case "gemini":
      _instance = new GeminiProvider();
      break;
    default: {
      // TypeScript exhaustiveness check — this path is unreachable if the
      // EnvSchema is correct, but the runtime guard protects against
      // invalid process.env mutations.
      const _exhaustive: never = env.LLM_PROVIDER;
      throw new Error(`Unknown LLM_PROVIDER: ${String(_exhaustive)}`);
    }
  }

  return _instance;
}

/**
 * Reset the singleton (for testing purposes only).
 * @internal
 */
export function _resetLLMProvider(): void {
  _instance = null;
}
