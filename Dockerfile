# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS build

ARG NUXT_PUBLIC_SITE_URL=https://manual.arx.capturecontext.dev
ARG RAILWAY_ENVIRONMENT_NAME

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL
ENV RAILWAY_ENVIRONMENT_NAME=$RAILWAY_ENVIRONMENT_NAME

WORKDIR /app

RUN npm install --global pnpm@12.0.0-rc.8

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm generate

FROM nginx:1.31.8-alpine AS runtime

ENV RAILWAY_ENVIRONMENT_NAME=local

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/manual/.output/public /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
