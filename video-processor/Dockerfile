FROM node:22-alpine AS deps
WORKDIR /app

COPY video-processor/package.json /app/package.json

RUN npm install

FROM node:22-alpine AS builder

WORKDIR /app

COPY video-processor .
COPY --from=deps /app/node_modules ./node_modules

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV production

ENTRYPOINT ["npm", "run", "start:prod"]
