FROM node:18.15.0-alpine3.17 AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# First install the dependencies (as they change less often)
COPY . .
RUN npm ci
RUN npx turbo prune --scope=frontend --docker

# Build the project
RUN npx turbo build --filter=frontend

FROM nginx:latest
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist/ /usr/share/nginx/html/
