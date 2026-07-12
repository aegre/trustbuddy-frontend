/**
 * App-facing DTO aliases over Orval-generated models.
 * Import from `@/api/types` in feature code — not from generated paths.
 */
export type {
  AuthMeResponse,
  AuthTokenRequest,
  AuthTokenResponse,
  CreateQuoteRequest,
  ListQuotesParams,
  QuoteResponse,
  UpdatePersonalInfoRequest,
  UpdateCoverageRequest,
  PageQuoteResponse,
} from "@/api/generated/model";

export type { ApiError, ApiErrorBody } from "@/api/errors";
export {
  createApiError,
  getApiErrorMessage,
  getUserFacingErrorMessage,
  isApiError,
} from "@/api/errors";
