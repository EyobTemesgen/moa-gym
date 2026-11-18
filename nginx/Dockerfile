FROM node:22-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
ARG APP_VERSION=1.0.0
ARG APP_COMMIT=
RUN VITE_APP_VERSION=$APP_VERSION VITE_APP_COMMIT=$APP_COMMIT npx vite build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
