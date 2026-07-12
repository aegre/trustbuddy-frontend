# trustbuddy-frontend

React (Vite) SPA for the Trustbuddy insurance quote flow. Pairs with [trustbuddy-api](https://github.com/aegre/trustbuddy-api).

## Prerequisites

- Node.js LTS and npm
- `make`
- Docker + Docker Compose (for the API stack and optional frontend container)
- Sibling clone of [trustbuddy-api](https://github.com/aegre/trustbuddy-api) next to this repo (`../trustbuddy-api`) — use `make clone-api` if you do not have it yet

## Installation

```bash
make clone-api          # clones ../trustbuddy-api if missing
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:8080
make install            # npm install (+ Husky prepare)
```

Override clone location or remote if needed:

```bash
make clone-api API_REPO=../trustbuddy-api API_GIT_URL=https://github.com/aegre/trustbuddy-api.git
```

In the API repo, also copy `.env.example` → `.env`. For browser login from Vite and/or the frontend Docker image, set:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Run everything in Docker

With the API sibling checked out beside this repo:

```bash
make stack-all-up       # API + Postgres/Redis/Kafka (if present) + frontend
# Frontend: http://localhost:3000
# API:      http://localhost:8080  (Swagger: /swagger-ui.html)
make stack-all-down     # stop both
```

If `../trustbuddy-api` is missing, `stack-all-up` warns and starts the frontend containers only.

## Run the API (Docker)

From `trustbuddy-api`:

```bash
make stack-up           # API + PostgreSQL + Redis + Kafka (creates .env from .env.example if missing)
```

Host JVM alternative (infra still in Docker):

```bash
make infra-up
make run-dev            # API on http://localhost:8080
```

## Run the frontend (local Vite)

Typical while iterating (API already up):

```bash
make run                # or make dev → http://localhost:5173
```

Frontend-only Docker:

```bash
make stack-up           # http://localhost:3000 — creates .env if missing; still needs API on :8080
```

## Dev login

Local API default: `dev-user` / `dev-password`.

## Verify / OpenAPI

```bash
make verify             # build + lint + format check + unit tests
```

After API contract changes: in the API repo run `make openapi-export`, then here `make openapi-update`.

---

# Thought Process

So first thing before doing any code is to get the whole picture to translate it to technical requirements.

- React + Typescript
- Material UI for components
- React Hook Form + Yup for forms
- State Context API (UI/auth state)
- Navigation React Router
- Integration with trustbuddy-api
- Testing Playwright + Vitest

So according to these requirements we need to use React + Vite for a CSR application. I was initially planning to build a Next.js application due to how I can handle the different routes internally in the server side, but a client focused rendering logic makes sense, I just need to focus on code splitting to make the form as smooth as possible. Also I can use Tanstack Query for server state (quotes, API responses), using caching to avoid hitting the api as much as possible, while invalidating the cache when needed. Context stays for UI and auth state so it does not overlap with Query.

## The Plan

The first thing is to keep the ui as minimal as possible, functionality over look and feel. In the end with time we can focus on enhancing the overall experience.

I can foresee 9 main steps, with intermediate steps for optimizations and tuning.

1. Initial setup dependencies/linter/agent rules/makefile
2. Login Screen with request
3. Dashboard/list of quotes
4. Wizard setup
5. Wizard personal data step
6. Wizard coverage step
7. Wizard confirmation step + success screen
8. Pagination on dashboard
9. UI tweaks

## Technical extras

We are also using OpenAPI from the api project so this way we can generate api types easily, we just need a way to sync the generated schema from swagger. Dockerizing a project like this is not a big deal, we can just serve the static files or run react inside the container. I'll go with the second approach. For testing: Vitest + MSW for unit/component tests, Playwright for E2E.

# Technical decisions

Documented as **decision**, **why**, and **alternatives** considered.

### Vite + React CSR SPA

**Decision:** Ship a client-side React app with Vite, not Next.js (or another full-stack React framework).

**Why:** The product is an authenticated quote dashboard and multi-step wizard that already leans on React Context for UI/auth session flags and on client-side routing for wizard steps (`/wizard/:stepSlug?quoteId=`). A CSR SPA matches that model without SSR/RSC overhead. Putting React Router beside Next’s App Router or Pages Router would compete for navigation ownership, invite subtle routing bugs, and hurt wizard UX.

**Alternatives:** Next.js (App Router or Pages), Remix, or another meta-framework with server rendering and file-based routes.

### TanStack Query for server state; Context for UI/auth only

**Decision:** Orval-generated TanStack Query hooks own quotes and API payloads; React Context holds logged-in flags, loading, and username only—not quote DTOs.

**Why:** List/detail caching, refetch, and invalidation after wizard mutations are Query’s job. Stashing API entities in Context overlaps Query, causes stale UI, and makes invalidation harder. Context stays thin for session chrome.

**Alternatives:** Redux/Zustand for everything; Context-only server state; SWR instead of TanStack Query.

### React Router for wizard and app navigation

**Decision:** Use React Router for login, quotes list, wizard steps, and success URLs.

**Why:** Step identity and `quoteId` live in the URL so refresh/deep-link/back work. One client router keeps the wizard model simple in a CSR app.

**Alternatives:** Next file-based routes; wizard state only in memory/Context without URL steps.

### HttpOnly cookie auth (never store the JWT in web storage)

**Decision:** Login via `POST /api/v1/auth/token` with `credentials: 'include'`; session restore via `GET /api/v1/auth/me`; logout clears the cookie. Do not put the JWT in `localStorage` or `sessionStorage`.

**Why:** Matches trustbuddy-api cookie sessions and reduces XSS token theft compared with JS-readable storage. The SPA only needs “am I logged in?” in Context.

**Alternatives:** Bearer token in memory or web storage.

### Orval clients + MSW from the OpenAPI contract

**Decision:** Sync `openapi/openapi.json` from trustbuddy-api and generate React Query clients, models, and MSW handlers with Orval; import DTO aliases from `@/api/types` only.

**Why:** Keeps the frontend aligned with the API without hand-written fetch layers. Tests reuse generated MSW handlers instead of mocking inside the running app.

**Alternatives:** Hand-written `fetch`/axios clients; OpenAPI Generator; Pact or ad-hoc fixtures only.

### Vitest + MSW (+ Playwright later for E2E)

**Decision:** Unit/component tests with Vitest, Testing Library, and MSW; Playwright config reserved for E2E flows.

**Why:** Fast feedback on forms, routes, and Query behavior without a real API. E2E stays optional and out of `make verify` until flows stabilize.

**Alternatives:** Jest; Cypress; mock modules instead of network; only E2E.

# Challenges

Hard problems I hit while building, how I handled them, and what is still imperfect.

### Syncing OpenAPI without a deployed API

**Challenge:** Orval needs an OpenAPI JSON, but the API is not published to a cloud Swagger host yet.

**What I did:** Sync from a local sibling checkout (`../trustbuddy-api`) via `make openapi-update` after `make openapi-export` in the API repo. Use `make clone-api` to clone the sibling if it is missing.

**Still imperfect:** You still need a local API checkout and a fresh export. An ideal setup would pull the contract from a hosted Swagger/OpenAPI URL in CI and locally.

### Preserving quote identity across refresh (and wizard route guards)

**Challenge:** A refresh mid-wizard must not throw away the in-progress quote, and users must not jump to coverage/review without enough data.

**What I did:** Prefer the **URL** over `localStorage`/`sessionStorage` for continuity. Keep the path clean as `/wizard/:stepSlug` and pass identity as a search param (`?quoteId=`), rather than embedding the id in the path. Step access reuses Yup-aligned guards (`isWizardStepAccessible` and related helpers): if the user should not be on the current step, redirect them.

**Alternatives considered:** Persist draft state in web storage (weaker—easy to go stale vs the API); put `quoteId` in the path (`/wizard/:quoteId/:stepSlug`).

**Still imperfect:** On a **new** quote, step 1 is `/wizard/personal` with no `quoteId` until Continue creates the quote and navigates to coverage. If the user then uses the browser Back button to the pre-create personal URL and refreshes, that history entry still has no id, so the session with that quote is lost from the URL. Putting `quoteId` on personal as soon as the quote exists (and replacing history) would tighten this.

### Adopting BDD-style tests

**Challenge:** Wanted given/when/then clarity in tests without heavy ceremony.

**What we did:** Tried libraries such as vitest-gwt and Cucumber-style runners; they did not add enough value for this codebase. Kept **BDD-style naming and comments** (`given_…_when_…_then_…`) on Vitest tests instead.

**Alternatives:** Full Cucumber/Gherkin suites; vitest-gwt as a hard dependency; plain descriptive test names only.

# AI Driven Development

This project was developed with **Cursor** as the main AI coding tool. Clear guardrails live in `AGENTS.md`, with a reliable unit/component suite for new changes. The initial plan in this README fed a more detailed phased plan (`BUILD_JOURNEY.md`) with boundaries, deliverables, and progress.

For design exploration outside the IDE:

- **Lovable** — quick UI mockups
- **Lovart** — refining visuals before / while implementing in the app

# Deferred & out of scope

Work not done yet, or deliberately left out of this delivery. Fine for local/dev use of the main quote flow.

### Wizard layout coupled to every step

**Left out of scope:** Fully decoupling step content from the shared wizard chrome (stepper + card shell).

**Why it matters later:** A future step that should not show the stepper (or needs a different shell) would fight the current `WizardLayout` + step registry structure. Success already sits outside that chrome; more exceptions would need a clearer layout/step split.

### End-user registration UI

**Left out:** Sign-up / invite flow for real users.

**Direction considered:** Email OTP for login and new users. Skipped for now because the main feature can be exercised with **development users** (`dev-user` / `dev-password`).

### Token refresh

**Not built:** Silent refresh when the access cookie expires.

**Current behavior:** Any authenticated call that returns **401** clears the session and logs the user out. Acceptable for local development; poor for long sessions in a real deployment. A refresh-token or sliding-session flow on the API + frontend would be the follow-up.

### OpenAPI from the cloud

**Still manual/sibling-based:** Contract sync depends on a local API export. Hosting Swagger and pointing Orval/CI at that URL remains future work (see Challenges).

### Stronger wizard URL continuity

**Still open:** Avoid losing `quoteId` when browser history points at personal-without-id (see Challenges). Options include replacing the personal history entry as soon as the quote is created, or always keeping `quoteId` on personal once known.

### Playwright E2E in CI

Config exists for later happy-path flows; not required by `make verify` yet.

### Sentry (production observability)

**Not integrated:** Error monitoring and related production tooling via [Sentry](https://sentry.io).

**Why it matters later:** The main win is reliable **error logs** (uncaught exceptions, failed requests) with stack traces and release context. In production Sentry also covers performance monitoring, session replay, alerts, and release health—useful once the app is deployed beyond local/dev.

**Deferred because:** Local development and the current quote flow do not need a hosted error pipeline yet.

# Sibling repo

https://github.com/aegre/trustbuddy-api
