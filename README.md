# trustbuddy-frontend

React (Vite) SPA for the Trustbuddy insurance quote flow. Pairs with [trustbuddy-api](https://github.com/aegre/trustbuddy-api).

## Prerequisites

- Node.js LTS and npm
- `make`
- Docker + Docker Compose (for the API stack and optional frontend container)
- Sibling clone of [trustbuddy-api](https://github.com/aegre/trustbuddy-api) next to this repo (`../trustbuddy-api`)

## Installation

```bash
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:8080
make install            # npm install (+ Husky prepare)
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
cp .env.example .env
make stack-up           # API + PostgreSQL + Redis + Kafka
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
make stack-up           # http://localhost:3000 — still needs API on :8080
```

## Dev login

Local API default: `dev-user` / `dev-password`.

## Verify / OpenAPI

```bash
make verify             # build + lint + format check + unit tests
```

After API contract changes: in the API repo run `make openapi-export`, then here `make openapi-update`.

---

# Thought process

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

# AI Driven Development

This project will be developed using cursor as the main AI tool. To ensure code quality I will establish clear guardrails and best practices by using AGENTS.MD and establishing a reliable testing suite of new changes. With the initial plan established in this readme I will create a more detailed plan using an AI agent to establish clear boundaries and deliverables for each phase as well as registering the project progress.

# Sibling repo

https://github.com/aegre/trustbuddy-api
