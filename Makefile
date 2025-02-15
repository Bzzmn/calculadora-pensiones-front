# Variables
APP_NAME = mi-app-react
DOCKER_IMAGE = $(APP_NAME):latest
CONTAINER_NAME = $(APP_NAME)-container
PORT = 3000

# Colores para los mensajes
CYAN = \033[0;36m
NC = \033[0m # No Color

# Comandos de desarrollo local

.PHONY: build
build:
	@echo "$(CYAN)Construyendo la aplicación...$(NC)"
	npm run build

.PHONY: lint
lint:
	@echo "$(CYAN)Ejecutando linter...$(NC)"
	npm run lint

# Comandos de Docker
.PHONY: docker-build
docker-build:
	@echo "$(CYAN)Construyendo imagen Docker...$(NC)"
	docker build -t $(DOCKER_IMAGE) .

.PHONY: docker-run
docker-run:
	@echo "$(CYAN)Iniciando contenedor...$(NC)"
	docker run -d -p $(PORT):3000 --name $(CONTAINER_NAME) $(DOCKER_IMAGE)

.PHONY: docker-stop
docker-stop:
	@echo "$(CYAN)Deteniendo contenedor...$(NC)"
	docker stop $(CONTAINER_NAME)

.PHONY: docker-remove
docker-remove: docker-stop
	@echo "$(CYAN)Eliminando contenedor...$(NC)"
	docker rm $(CONTAINER_NAME)

.PHONY: docker-logs
docker-logs:
	@echo "$(CYAN)Mostrando logs del contenedor...$(NC)"
	docker logs -f $(CONTAINER_NAME)

# Comandos de limpieza
.PHONY: clean
clean:
	@echo "$(CYAN)Limpiando archivos generados...$(NC)"
	rm -rf dist
	rm -rf node_modules

.PHONY: docker-clean
docker-clean:
	@echo "$(CYAN)Limpiando recursos Docker...$(NC)"
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)
	-docker rmi $(DOCKER_IMAGE)

# Comando de ayuda
.PHONY: help
help:
	@echo "$(CYAN)Comandos disponibles:$(NC)"
	@echo "  make install         - Instala las dependencias del proyecto"
	@echo "  make dev            - Inicia el entorno de desarrollo"
	@echo "  make build          - Construye la aplicación"
	@echo "  make lint           - Ejecuta el linter"
	@echo "  make docker-build   - Construye la imagen Docker"
	@echo "  make docker-run     - Ejecuta el contenedor"
	@echo "  make docker-stop    - Detiene el contenedor"
	@echo "  make docker-remove  - Elimina el contenedor"
	@echo "  make docker-logs    - Muestra los logs del contenedor"
	@echo "  make clean          - Limpia archivos generados localmente"
	@echo "  make docker-clean   - Limpia recursos Docker" 