# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="React"

# React app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# npm is already available in the base image


# Throw-away build stage to reduce size of final image
FROM base AS build

# Set NODE_ENV to development for the build stage to install all dependencies
ENV NODE_ENV="development"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules (including dev dependencies)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production


# Final stage for app image
FROM base

# Install curl and wget for healthchecks
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl wget && \
    rm -rf /var/lib/apt/lists/*

# Install serve globally
RUN npm install -g serve

# Copy built application and serve config
COPY --from=build /app/dist /app/dist
COPY serve.json /app/serve.json

# Start the server, using PORT env var (Coolify sets PORT=80)
EXPOSE 3000
CMD serve dist -l ${PORT:-3000}
