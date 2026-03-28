# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# --ignore-scripts prevents husky's prepare hook from failing inside Docker
RUN npm ci --ignore-scripts


# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# VITE_ vars are baked into the bundle at build time.
# Left empty so the app uses relative URLs (/api/, /socket.io/)
# and nginx handles proxying to the backend — no hostname hardcoding.
ARG VITE_API_BASE_URL=
ARG VITE_WS_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

RUN npm run build


# ─── Stage 3: runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

# Store the template — envsubst will render it at container startup
COPY nginx.conf /etc/nginx/templates/app.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# envsubst replaces ${BACKEND_HOST} with the runtime env var, then starts nginx
# Default value covers Docker Compose where the backend service is named "backend"
ENV BACKEND_HOST=backend:3000

CMD ["/bin/sh", "-c", "envsubst '${BACKEND_HOST}' < /etc/nginx/templates/app.conf.template > /etc/nginx/conf.d/app.conf && nginx -g 'daemon off;'"]
