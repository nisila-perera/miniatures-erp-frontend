# Miniatures.lk ERP System - Frontend Docker Management
# =====================================================

.PHONY: help dev prod build-dev build-prod up-dev up-prod down logs clean test

# Default target
help:
	@echo "Miniatures.lk ERP System - Frontend Commands"
	@echo "============================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make build-dev    - Build development containers"
	@echo "  make logs-dev     - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Start production environment"
	@echo "  make build-prod   - Build production containers"
	@echo "  make logs-prod    - View production logs"
	@echo ""
	@echo "Common:"
	@echo "  make down         - Stop all containers"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make test         - Run frontend tests"
	@echo "  make shell        - Open shell in frontend container"

# Development commands
dev: build-dev up-dev

build-dev:
	docker compose build

up-dev:
	docker compose up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"

logs-dev:
	docker compose logs -f

# Production commands
prod: build-prod up-prod

build-prod:
	docker compose -f docker-compose.prod.yml build

up-prod:
	docker compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Frontend: http://localhost"

logs-prod:
	docker compose -f docker-compose.prod.yml logs -f

# Stop containers
down:
	docker compose down
	docker compose -f docker-compose.prod.yml down

# Clean everything
clean:
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.prod.yml down -v --remove-orphans
	docker system prune -f

# Run tests
test:
	docker compose exec frontend npm test

test-local:
	npm test

# Shell access
shell:
	docker compose exec frontend sh

shell-prod:
	docker compose -f docker-compose.prod.yml exec frontend sh

# Health checks
health:
	@echo "Checking frontend health..."
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend: OK" || echo "Frontend not responding"

health-prod:
	@echo "Checking production frontend health..."
	@curl -s http://localhost/health || echo "Frontend not responding"

# Restart services
restart:
	docker compose restart frontend

restart-prod:
	docker compose -f docker-compose.prod.yml restart frontend

# Local development (without Docker)
run-local:
	npm run dev

install:
	npm install

build-local:
	npm run build

