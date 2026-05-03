FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/mcp/package.json ./packages/mcp/
RUN pnpm install --filter @danielsuchan/mcp --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/mcp/node_modules ./packages/mcp/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/mcp ./packages/mcp
WORKDIR /app/packages/mcp
RUN pnpm run build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/packages/mcp/node_modules ./node_modules
COPY --from=build /app/packages/mcp/dist ./dist
COPY --from=build /app/packages/mcp/package.json ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["node", "dist/server-node.js"]
