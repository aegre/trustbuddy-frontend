export type ApiErrorBody = unknown;

export type ApiError = Error & {
  status: number;
  data?: ApiErrorBody;
  headers?: Headers;
};

export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof (error as ApiError).status === "number"
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (!isApiError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  const { data, message, status } = error;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    for (const key of ["message", "error", "detail", "title"] as const) {
      const value = body[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  if (message && message !== `API request failed with status ${status}`) {
    return message;
  }

  return fallback;
}

export function createApiError(
  status: number,
  data: ApiErrorBody,
  headers?: Headers,
): ApiError {
  const error = new Error(
    `API request failed with status ${status}`,
  ) as ApiError;
  error.status = status;
  error.data = data;
  error.headers = headers;
  return error;
}
