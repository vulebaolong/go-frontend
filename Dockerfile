FROM node:24.1.0-alpine AS deps
WORKDIR /go_frontend
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && npm ci --legacy-peer-deps

FROM node:24.1.0-alpine AS builder
WORKDIR /go_frontend
COPY . .
COPY --from=deps /go_frontend/node_modules ./node_modules

ARG NEXT_PUBLIC_BASE_DOMAIN_BE
ARG NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY


ENV NEXT_PUBLIC_BASE_DOMAIN_BE=${NEXT_PUBLIC_BASE_DOMAIN_BE}
ENV NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY=${NEXT_PUBLIC_BASE_DOMAIN_CLOUDINARY}

RUN npm run build

FROM node:24.1.0-alpine AS runner
WORKDIR /go_frontend
COPY --from=builder /go_frontend/.next/standalone ./
COPY --from=builder /go_frontend/public ./public
COPY --from=builder /go_frontend/.next/static ./.next/static

CMD ["node", "server.js"]
