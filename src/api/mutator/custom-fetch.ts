import { createApiError } from "@/api/errors";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = getApiBaseUrl().replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

async function getBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

/**
 * Orval mutator: browser fetch with credentials for HttpOnly cookie auth.
 * Returns Orval's `{ data, status, headers }` envelope.
 */
export async function customFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(resolveUrl(url), {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...options?.headers,
    },
  });

  const data = await getBody(response);

  if (!response.ok) {
    throw createApiError(response.status, data, response.headers);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
}
