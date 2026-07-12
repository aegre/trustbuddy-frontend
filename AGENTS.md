# Trustbuddy Frontend — Agent Instructions

Vite + React 19 + TypeScript (CSR). Pairs with [trustbuddy-api](https://github.com/aegre/trustbuddy-api). See [ARCHITECTURE.md](ARCHITECTURE.md) for system overview and [BUILD_JOURNEY.md](BUILD_JOURNEY.md) for phased delivery.

## Stack

| Area            | Choice                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| UI              | Material UI (MUI) + Emotion                                                                                                 |
| Routing         | React Router                                                                                                                |
| Forms           | React Hook Form + Yup (`@hookform/resolvers/yup`)                                                                           |
| Server state    | TanStack Query (quotes, mutations, cache invalidation)                                                                      |
| UI / auth state | React Context — logged-in flags, wizard UI-only state; **not** API payloads                                                 |
| Auth session    | HttpOnly cookie via `POST /api/v1/auth/token`; requests use `credentials: 'include'`; logout via `POST /api/v1/auth/logout` |
| API             | Orval-generated React Query clients + MSW mocks → `customFetch` (cookie credentials) → trustbuddy-api                       |
| Formatting      | Prettier (`make format` / `make format-check`)                                                                              |
| Linting         | Oxlint — React, jsx-a11y, react-perf (`make lint`)                                                                          |

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

| Subfolder     | Purpose                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `components/` | Feature UI (forms, cards, shells)                                                               |
| `screens/`    | Full-page screen composition (e.g. login)                                                       |
| `layouts/`    | Route layouts (providers, shared chrome)                                                        |
| `context/`    | React context providers (when needed)                                                           |
| `hooks/`      | Feature hooks (Query wrappers OK here)                                                          |
| `types/`      | Domain types and registries                                                                     |
| `utils/`      | Pure helpers, mappers, guards, formatters                                                       |
| `schemas/`    | Yup validation for feature forms                                                                |
| `client/`     | Prefer Orval-generated hooks under `src/api/generated/`; keep feature wrappers only when needed |

- **`routes/`** — routing, redirects, auth guards; delegate UI to `features/`.
- **`api/`** — shared spine: `customFetch` mutator, config, DTO aliases in `types.ts`, Orval output under `generated/`. No feature UI.
- **`features/common/`** — shared across features (e.g. `AppThemeProvider`, MUI theme).
- **`features/*`** — domain modules; wizard steps split into `components/steps/*-step.tsx` (wiring) and `*-form.tsx` (RHF + MUI fields).
- **Query vs Context** — use Orval/TanStack Query hooks for server data; Context for UI/auth session only. Do not stash quote DTOs in Context.

## Conventions

- Use `@/` path alias (`src/*`).
- Validate forms with Yup schemas in `features/*/schemas/`; wire via `yupResolver`.
- Run `make verify` before finishing once the Makefile exists (compile + lint + format check + unit tests).
- After `npm install`, Husky installs the pre-commit hook via `prepare`. Use `make precommit` to format and lint **staged files only** (same as the hook).
- **Testing** — Vitest + MSW. Prefer Orval-generated handlers from `src/api/generated/**/*.msw.ts` in `src/test/msw/`; do **not** mock API responses in the running app.
- Local API: frontend `make run` / `npm run dev` + trustbuddy-api `make run-dev`.
- OpenAPI contract: `make openapi-update` syncs `../trustbuddy-api/openapi/openapi.json` → `openapi/openapi.json` (gitignored) and regenerates Orval clients/models/MSW via `orval.config.ts`. Use `make openapi-sync` or `make openapi-codegen` alone when needed. Refresh the API export first with `make openapi-export` in trustbuddy-api.
- **API DTO types** — import from `@/api/types` only. Do **not** import generated model files outside `types.ts` / Orval output consumers.
  - `types.ts` re-exports aliases over Orval models (e.g. `AuthTokenRequest`, `QuoteResponse`).
  - Form Yup schemas stay hand-written in `features/*/schemas/` but should align with request DTO shapes.
- **Never** store the JWT in `localStorage` or `sessionStorage`.

## Do not commit

- `.env`, `.env.local` (use `.env.example` as template)
- `node_modules/`, `dist/`, build artifacts
- `openapi/openapi.json` (synced locally from trustbuddy-api)
- Secrets and credentials

## Commit generated clients

- `src/api/generated/**` — regenerate with `make openapi-update` when the API contract changes
