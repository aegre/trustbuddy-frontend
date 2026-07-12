.DEFAULT_GOAL := help

NPM := npm
DOCKER_IMAGE := trustbuddy-frontend:local
COMPOSE := docker compose
VITE_API_BASE_URL ?= http://localhost:8080
API_REPO ?= ../trustbuddy-api
OPENAPI_SPEC := openapi/openapi.json
API_OPENAPI_SPEC := $(API_REPO)/openapi/openapi.json

# Load .env when present; export only .env keys (not Make internals)
ifneq (,$(wildcard .env))
include .env
export $(shell sed -n 's/=.*//p' .env)
endif

.PHONY: help install run dev build lint format format-check precommit test verify openapi-sync openapi-codegen openapi-update docker-build stack-up stack-down stack-logs

help: ## Show available targets
	@echo "Trustbuddy Frontend — available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"}; {printf "  %-18s %s\n", $$1, $$2}'

install: ## Install npm dependencies
	$(NPM) install

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

docker-build: ## Build frontend Docker image
	docker build -t $(DOCKER_IMAGE) --build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) .

stack-up: ## Build and start frontend in Docker
	$(COMPOSE) up -d --build

stack-down: ## Stop frontend container
	$(COMPOSE) down

stack-logs: ## Tail frontend container logs
	$(COMPOSE) logs -f
