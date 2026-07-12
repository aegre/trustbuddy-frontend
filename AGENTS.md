# Trustbuddy Frontend — Agent Instructions

Vite + React 19 + TypeScript (CSR). Pairs with [trustbuddy-api](https://github.com/aegre/trustbuddy-api). See [ARCHITECTURE.md](ARCHITECTURE.md) for system overview and [BUILD_JOURNEY.md](BUILD_JOURNEY.md) for phased delivery.

## Stack

| Area | Choice |
|------|--------|
| UI | Material UI (MUI) + Emotion |
| Routing | React Router |
| Forms | React Hook Form + Yup (`@hookform/resolvers/yup`) |
| Server state | TanStack Query (quotes, mutations, cache invalidation) |
| UI / auth state | React Context — logged-in flags, wizard UI-only state; **not** API payloads |
| Auth session | HttpOnly cookie via `POST /api/v1/auth/token`; requests use `credentials: 'include'`; logout via `POST /api/v1/auth/logout` |
| API | Feature `client/` modules → shared `apiFetch` → trustbuddy-api; real API in the app; MSW in unit tests only |
| Formatting | Prettier (`make format` once wired) |
| Linting | Project lint target (`make lint` once wired; currently oxlint from Vite scaffold) |

## Folder layout

Full diagram and layer rules: [ARCHITECTURE.md](ARCHITECTURE.md).

```
src/
  api/              # shared HTTP transport + OpenAPI DTO aliases
  features/
    common/         # cross-feature shared UI and theme
    auth/           # login
    quotes/         # quotes list
    wizard/         # quote wizard
  routes/           # routes only — thin pages, guards, layouts
  test/             # Vitest setup, MSW handlers, factories
```

Each feature module uses subfolders as they gain files (no empty placeholders):

| Subfolder | Purpose |
|-----------|---------|
| `components/` | Feature UI (forms, cards, shells) |
| `screens/` | Full-page screen composition (e.g. login) |
| `layouts/` | Route layouts (providers, shared chrome) |
| `context/` | React context providers (when needed) |
| `hooks/` | Feature hooks (Query wrappers OK here) |
| `types/` | Domain types and registries |
| `utils/` | Pure helpers, mappers, guards, formatters |
| `schemas/` | Yup validation for feature forms |
| `client/` | Browser API endpoint wrappers over `apiFetch` |

- **`routes/`** — routing, redirects, auth guards; delegate UI to `features/`.
- **`api/`** — shared spine only: `apiFetch`, config, errors, OpenAPI codegen, DTO aliases in `types.ts`. No feature logic.
- **`features/common/`** — shared across features (e.g. `AppThemeProvider`, MUI theme).
- **`features/*`** — domain modules; wizard steps split into `components/steps/*-step.tsx` (wiring) and `*-form.tsx` (RHF + MUI fields).
- **Query vs Context** — Query for server data; Context for UI/auth session only. Do not stash quote DTOs in Context.

## Conventions

- Use `@/` path alias (`src/*`).
- Validate forms with Yup schemas in `features/*/schemas/`; wire via `yupResolver`.
- Run `make verify` before finishing once the Makefile exists (compile + lint + format check + unit tests).
- After `npm install`, Husky should install the pre-commit hook via `prepare` (when added). Use `make precommit` to format and lint **staged files only** (same as the hook).
- **Testing** — Vitest + MSW (`src/test/msw/`). Intercept HTTP in tests via `setupServer`; do **not** mock API responses in the running app. Prefer MSW handlers over `vi.mock` of `client/` modules when the code under test calls the API.
- Local API: frontend `make dev` / `npm run dev` + trustbuddy-api `make run-dev`.
- OpenAPI contract: `make openapi-update` syncs `../trustbuddy-api/openapi/openapi.json` → `openapi/openapi.json` (gitignored) and regenerates `src/api/generated/schema.ts` via `openapi-typescript`. Use `make openapi-sync` to copy the spec only, or `make openapi-codegen` after a manual sync. Refresh the API export first with `make openapi-export` in trustbuddy-api.
- API paths use the `/api/v1` prefix from the OpenAPI spec (`apiFetch` auto-prefixes).
- **API DTO types** — import from `@/api/types` only. Do **not** import `components`, `paths`, or `operations` from `src/api/generated/schema.ts` outside `types.ts`; that file is codegen output and an implementation detail.
  - `types.ts` owns aliases over the generated schema (e.g. `AuthTokenRequest`, `QuoteResponse`) plus app-only types (e.g. `ApiErrorBody`).
  - When OpenAPI marks response fields optional but runtime code requires them, add a `*Body` wire type and a narrowed validated type in `types.ts`.
  - Form Yup schemas stay hand-written in `features/*/schemas/` but should align with request DTO shapes; prefer reusing DTO types (e.g. `AuthTokenRequest`) over duplicating inline `{ username; password }` objects.
- **Never** store the JWT in `localStorage` or `sessionStorage`.

## Do not commit

- `.env`, `.env.local` (use `.env.example` as template)
- `node_modules/`, `dist/`, build artifacts
- `openapi/openapi.json` (synced locally from trustbuddy-api)
- Secrets and credentials

## Commit generated types

- `src/api/generated/schema.ts` — regenerate with `make openapi-update` when the API contract changes
