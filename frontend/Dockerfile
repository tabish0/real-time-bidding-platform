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


# ─── Stage 3: runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# PORT: Railway sets this dynamically; defaults to 80 for local Docker.
# BACKEND_HOST: overridden by docker-compose for local proxying.
#   On Railway, VITE_API_BASE_URL is baked into the bundle so the proxy
#   locations are never reached — the default value is just a placeholder.
ENV PORT=80
ENV BACKEND_HOST=localhost:3000

EXPOSE 80

# envsubst fills in ${PORT} and ${BACKEND_HOST} at container start, then nginx runs
CMD ["nginx", "-g", "daemon off;"]
