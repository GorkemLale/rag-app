.PHONY: build up down dev logs clean

# Production
build:
	docker compose build

up:
	docker compose up -d

down:
	docker comse down

# Development
dev:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

# Utilities
logs:
	docker logs -f rag-backend-container

logs-dev:
	docker logs -f rag-backend-dev-container

clean:
	docker compose down -v
	docker system prune -f

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

test:
	curl http://localhost:5000/healt
