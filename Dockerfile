# Etapa de construcción
FROM node:20-alpine as builder
WORKDIR /app

# Agregar argumento para la variable de entorno
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm run build

# Etapa de producción
FROM nginx:alpine
# Copiar los archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiar configuración personalizada de nginx si es necesaria
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]