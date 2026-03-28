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

# Baked in at build time — set these in Railway Variables tab so the
# browser calls the backend public URL directly (free tier has no private networking)
ARG VITE_API_BASE_URL=
ARG VITE_WS_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

RUN npm run build


# ─── Stage 3: runtime (nginx) ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
