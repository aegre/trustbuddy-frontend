import { getAuthenticationMock } from "@/api/generated/authentication/authentication.msw";
import { getQuotesMock } from "@/api/generated/quotes/quotes.msw";
import type { RequestHandler } from "msw";

/**
 * App MSW handler list for Vitest — composed from Orval-generated mocks.
 */
export const handlers: RequestHandler[] = [
  ...getAuthenticationMock(),
  ...getQuotesMock(),
];
