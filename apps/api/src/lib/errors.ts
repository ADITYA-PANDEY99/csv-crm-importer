/**
 * Application error hierarchy.
 *
 * Using a typed error class hierarchy lets the central error-handler
 * middleware make precise decisions about HTTP status codes and response
 * bodies without inspecting error messages.
 */

export type ErrorCode =
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "UPLOAD_FAILED"
  | "LLM_PROVIDER_ERROR"
  | "PARSE_ERROR"
  | "RATE_LIMITED";

export interface AppErrorOptions {
  message: string;
  code: ErrorCode;
  httpStatus: number;
  cause?: unknown;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Base application error. All domain errors extend this class.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor({ message, code, httpStatus, cause, details }: AppErrorOptions) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    if (details !== undefined) {
      this.details = details;
    }

    // Maintains proper prototype chain in ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Concrete error types ─────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Array<{ field: string; message: string }>
  ) {
    super({ message, code: "VALIDATION_ERROR", httpStatus: 422, ...(details !== undefined ? { details } : {}) });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({ message, code: "NOT_FOUND", httpStatus: 404 });
    this.name = "NotFoundError";
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(mimeType: string) {
    super({
      message: `Unsupported file type: "${mimeType}". Only CSV files are accepted.`,
      code: "UNSUPPORTED_FILE_TYPE",
      httpStatus: 415,
    });
    this.name = "UnsupportedFileTypeError";
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxBytes: number) {
    super({
      message: `File exceeds the maximum allowed size of ${(maxBytes / 1_048_576).toFixed(1)} MB.`,
      code: "FILE_TOO_LARGE",
      httpStatus: 413,
    });
    this.name = "FileTooLargeError";
  }
}

export class LLMProviderError extends AppError {
  constructor(message: string, cause?: unknown) {
    super({ message, code: "LLM_PROVIDER_ERROR", httpStatus: 502, cause });
    this.name = "LLMProviderError";
  }
}

export class ParseError extends AppError {
  constructor(message: string, cause?: unknown) {
    super({ message, code: "PARSE_ERROR", httpStatus: 422, cause });
    this.name = "ParseError";
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super({ message, code: "RATE_LIMITED", httpStatus: 429 });
    this.name = "RateLimitedError";
  }
}
