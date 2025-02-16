# Etapa de construcción
FROM node:20-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# Asegúrate de que se use el entorno de producción
ENV NODE_ENV=production
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]