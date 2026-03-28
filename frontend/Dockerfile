# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts


# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_BASE_URL=
ARG VITE_WS_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

RUN npm run build


# ─── Stage 3: runtime (serve) ─────────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 3000

# 'serve -s' enables SPA mode (all routes fall back to index.html)
# Uses $PORT if Railway sets it, otherwise defaults to 3000
CMD ["sh", "-c", "serve -s /app/dist -l ${PORT:-3000}"]
