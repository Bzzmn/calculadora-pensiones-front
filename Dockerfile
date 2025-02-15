# Etapa de construcción
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Instalar un servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer el puerto
EXPOSE 3000

# Comando para ejecutar la aplicación - modificado para escuchar en todas las interfaces
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]