FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci
COPY . .
ARG APP_NAME=api-gateway
RUN npx nest build ${APP_NAME}

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
RUN npm ci --omit=dev --ignore-scripts && npm rebuild bcrypt && npm cache clean --force

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
ARG APP_NAME=api-gateway
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist/apps/${APP_NAME} ./dist
USER node
CMD ["node", "dist/main.js"]
