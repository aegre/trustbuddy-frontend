.DEFAULT_GOAL := help

NPM := npm
DOCKER_IMAGE := trustbuddy-frontend:local
COMPOSE := docker compose
VITE_API_BASE_URL ?= http://localhost:8080

# Load .env when present; export only .env keys (not Make internals)
ifneq (,$(wildcard .env))
include .env
export $(shell sed -n 's/=.*//p' .env)
endif

.PHONY: help run build docker-build stack-up stack-down stack-logs

help: ## Show available targets
	@echo "Trustbuddy Frontend — available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?##"}; {printf "  %-18s %s\n", $$1, $$2}'

run: ## Run Vite dev server locally
	$(NPM) run dev

build: ## Production build
	$(NPM) run build

docker-build: ## Build frontend Docker image
	docker build -t $(DOCKER_IMAGE) --build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) .

stack-up: ## Build and start frontend in Docker
	$(COMPOSE) up -d --build

stack-down: ## Stop frontend container
	$(COMPOSE) down

stack-logs: ## Tail frontend container logs
	$(COMPOSE) logs -f
