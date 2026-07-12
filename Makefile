.DEFAULT_GOAL := help

NPM := npm
DOCKER_IMAGE := trustbuddy-frontend:local
COMPOSE := docker compose
VITE_API_BASE_URL ?= http://localhost:8080
API_REPO ?= ../trustbuddy-api
API_GIT_URL ?= https://github.com/aegre/trustbuddy-api.git
OPENAPI_SPEC := openapi/openapi.json
API_OPENAPI_SPEC := $(API_REPO)/openapi/openapi.json

# Load .env when present; export only .env keys (not Make internals)
ifneq (,$(wildcard .env))
include .env
export $(shell sed -n 's/=.*//p' .env)
endif

.PHONY: help install clone-api ensure-env run dev build lint format format-check precommit test verify openapi-sync openapi-codegen openapi-update docker-build stack-up stack-down stack-logs stack-all-up stack-all-down stack-all-logs

help: ## Show available targets
	@echo "Trustbuddy Frontend — available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"}; {printf "  %-18s %s\n", $$1, $$2}'

install: ## Install npm dependencies
	$(NPM) install

clone-api: ## Clone trustbuddy-api sibling next to this repo ($(API_REPO))
	@if [ -d "$(API_REPO)/.git" ] || [ -f "$(API_REPO)/Makefile" ]; then \
		echo "Sibling already present at $(API_REPO)"; \
	else \
		git clone "$(API_GIT_URL)" "$(API_REPO)"; \
		echo "Cloned $(API_GIT_URL) → $(API_REPO)"; \
	fi

ensure-env: ## Create .env from .env.example when .env is missing
	@if [ ! -f .env ]; then \
		test -f .env.example || (echo "Missing .env.example" && exit 1); \
		cp .env.example .env; \
		echo "Created .env from .env.example"; \
	fi

run: ## Run Vite dev server locally
	$(NPM) run dev

dev: run ## Alias for run

build: ## Production build
	$(NPM) run build

lint: ## Lint with oxlint (react, a11y, perf)
	$(NPM) run lint

format: ## Format with Prettier
	$(NPM) run format

format-check: ## Check Prettier formatting
	$(NPM) run format:check

precommit: ## Format and lint staged files (same as husky hook)
	$(NPM) run precommit

test: ## Run unit tests (Vitest)
	$(NPM) run test

verify: build lint format-check test ## Build, lint, format check, and unit tests

openapi-sync: ## Copy OpenAPI spec from trustbuddy-api
	@test -f $(API_OPENAPI_SPEC) || (echo "Missing $(API_OPENAPI_SPEC). Run make openapi-export in trustbuddy-api first." && exit 1)
	mkdir -p openapi
	cp $(API_OPENAPI_SPEC) $(OPENAPI_SPEC)
	@echo "Synced $(OPENAPI_SPEC)"

openapi-codegen: ## Generate API client/types/MSW mocks with Orval
	$(NPM) exec -- orval --config orval.config.ts

openapi-update: openapi-sync openapi-codegen ## Sync OpenAPI spec and regenerate Orval output

docker-build: ensure-env ## Build frontend Docker image
	docker build -t $(DOCKER_IMAGE) --build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) .

stack-up: ensure-env ## Build and start frontend in Docker
	$(COMPOSE) up -d --build

stack-down: ## Stop frontend container
	$(COMPOSE) down

stack-logs: ## Tail frontend container logs
	$(COMPOSE) logs -f

stack-all-up: ## Start API stack (if sibling present) + frontend containers
	@if [ -f "$(API_REPO)/Makefile" ]; then \
		$(MAKE) -C "$(API_REPO)" stack-up; \
	else \
		echo "Warning: $(API_REPO) not found — starting frontend only."; \
	fi
	$(MAKE) stack-up

stack-all-down: ## Stop frontend + API stack (if sibling present)
	$(MAKE) stack-down
	@if [ -f "$(API_REPO)/Makefile" ]; then \
		$(MAKE) -C "$(API_REPO)" stack-down; \
	fi

stack-all-logs: ## Tail frontend logs (prints hint for API logs if sibling present)
	@if [ -f "$(API_REPO)/Makefile" ]; then \
		echo "API logs: make -C $(API_REPO) stack-logs"; \
	fi
	$(MAKE) stack-logs
