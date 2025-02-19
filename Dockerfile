# Etapa de construcción
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Configura las variables de entorno para la construcción
ARG VITE_API_BASE_URL
ARG VITE_CHAT_AGENT_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CHAT_AGENT_URL=${VITE_CHAT_AGENT_URL}

# Construye la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]