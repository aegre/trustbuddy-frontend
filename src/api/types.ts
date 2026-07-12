/**
 * App-facing DTO aliases over Orval-generated models.
 * Import from `@/api/types` in feature code — not from generated paths.
 */
export type {
  AuthTokenRequest,
  AuthTokenResponse,
  CreateQuoteRequest,
  QuoteResponse,
  UpdatePersonalInfoRequest,
  UpdateCoverageRequest,
  PageQuoteResponse,
  Pageable,
} from "@/api/generated/model";

export type { ApiError, ApiErrorBody } from "@/api/errors";
export { createApiError, getApiErrorMessage, isApiError } from "@/api/errors";
