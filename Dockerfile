# syntax=docker/dockerfile:1

FROM oven/bun:1.3.13-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN bun run build

FROM base AS runtime
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --from=build /app/build ./build
USER bun

EXPOSE 3000

CMD ["bun", "run", "build/src/index.js"]