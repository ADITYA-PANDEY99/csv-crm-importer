import type {
  ApiError,
  HealthResponse,
  ImportJob,
  UploadResponse,
  CrmRecordsResponse,
} from "@csv-crm/shared";
import { clientEnv } from "@/config/env";

// ─── API Client Error ─────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly httpStatus: number;
  public readonly requestId?: string;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    apiError: ApiError,
    httpStatus: number,
    requestId?: string
  ) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.code = apiError.code;
    this.httpStatus = httpStatus;
    if (requestId !== undefined) {
      this.requestId = requestId;
    }
    if (apiError.details !== undefined) {
      this.details = apiError.details;
    }
  }
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  const resolvedBody: BodyInit | null =
    body instanceof FormData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : null;

  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1${path}`,
    {
      ...rest,
      headers,
      body: resolvedBody,
    }
  );

  const requestId = response.headers.get("X-Request-ID") ?? undefined;

  if (!response.ok) {
    let apiError: ApiError;
    try {
      const json = (await response.json()) as { error: ApiError };
      apiError = json.error;
    } catch {
      apiError = {
        code: "UNKNOWN_ERROR",
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    throw new ApiClientError(apiError, response.status, requestId);
  }

  return response.json() as Promise<T>;
}

// ─── Typed API methods ────────────────────────────────────────────────────────

export const apiClient = {
  health: {
    get: (): Promise<HealthResponse> => apiFetch("/health"),
  },

  uploads: {
    /**
     * POST /api/v1/uploads
     * Uploads a CSV file and returns a new import job.
     */
    create: (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch("/uploads", { method: "POST", body: formData });
    },

    /**
     * POST /api/v1/uploads/confirm
     * Send parsed CSV rows to start LLM CRM extraction.
     */
    confirm: (payload: {
      filename: string;
      fileSize: number;
      rows: Record<string, string>[];
    }): Promise<UploadResponse> => {
      return apiFetch("/uploads/confirm", {
        method: "POST",
        body: payload,
      });
    },

    /**
     * GET /api/v1/uploads/:jobId
     * Polls the status of an import job.
     */
    get: (jobId: string): Promise<{ success: true; data: ImportJob }> =>
      apiFetch(`/uploads/${jobId}`),
  },

  crmRecords: {
    /**
     * GET /api/v1/crm-records/:jobId?page=1&limit=100
     */
    list: (
      jobId: string,
      params: { page?: number; limit?: number } = {}
    ): Promise<CrmRecordsResponse> => {
      const query = new URLSearchParams({
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 100),
      });
      return apiFetch(`/crm-records/${jobId}?${query.toString()}`);
    },
  },
} as const;
