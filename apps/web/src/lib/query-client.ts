import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./api-client";

/**
 * Global React Query client configuration.
 *
 * Retry logic:
 *   - Never retry on 4xx errors (client mistakes — retrying won't help)
 *   - Retry up to 3 times on 5xx / network errors
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof ApiClientError && error.httpStatus < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
