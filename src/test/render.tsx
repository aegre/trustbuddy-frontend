import { render, renderHook, type RenderOptions } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactElement, ReactNode } from "react";
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { AppProviders } from "@/features/common/providers/app-providers";
import { createTestQueryClient } from "@/features/common/query/query-client";

export type ProvidersOptions = {
  initialAuthenticated?: boolean;
  queryClient?: QueryClient;
  /** `MemoryRouter` initial entry (default `/`). */
  route?: string;
};

function resolveQueryClient(queryClient?: QueryClient): QueryClient {
  return queryClient ?? createTestQueryClient();
}

/**
 * Wrapper for `renderHook` / nested UI — AppProviders + MemoryRouter.
 */
export function createProvidersWrapper(options: ProvidersOptions = {}) {
  const queryClient = resolveQueryClient(options.queryClient);
  const initialEntries = [options.route ?? "/"];

  function ProvidersWrapper({ children }: { children: ReactNode }) {
    return (
      <AppProviders
        initialAuthenticated={options.initialAuthenticated}
        queryClient={queryClient}
      >
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </AppProviders>
    );
  }

  return { Wrapper: ProvidersWrapper, queryClient };
}

/**
 * Render UI under theme, auth, React Query, and MemoryRouter.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProvidersOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  const { initialAuthenticated, queryClient, route, ...renderOptions } =
    options;
  const { Wrapper, queryClient: client } = createProvidersWrapper({
    initialAuthenticated,
    queryClient,
    route,
  });

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: client,
  };
}

export type RenderAppRouterOptions = ProvidersOptions & {
  initialEntry: string;
  routes: RouteObject[];
};

/**
 * Render a full memory router tree (guards, nested routes) under AppProviders.
 */
export function renderAppRouter(options: RenderAppRouterOptions) {
  const queryClient = resolveQueryClient(options.queryClient);
  const router = createMemoryRouter(options.routes, {
    initialEntries: [options.initialEntry],
  });

  const view = render(
    <AppProviders
      initialAuthenticated={options.initialAuthenticated}
      queryClient={queryClient}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );

  return { ...view, router, queryClient };
}

/**
 * `renderHook` with the same provider stack as `renderWithProviders`.
 */
export function renderHookWithProviders<TResult>(
  hook: () => TResult,
  options: ProvidersOptions = {},
) {
  const { Wrapper, queryClient } = createProvidersWrapper(options);
  return {
    ...renderHook(hook, { wrapper: Wrapper }),
    queryClient,
  };
}
