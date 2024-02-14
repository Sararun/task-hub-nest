FROM node:20-alpine AS dev

WORKDIR /var/www
RUN apk add --no-cache libc6-compat
ENV NODE_ENV dev

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

COPY --chown=app:app . .
RUN npm install --prefer-frozen-lockfile
RUN npx prisma generate
USER app

FROM node:20-alpine as build

WORKDIR /var/www
RUN apk add --no-cache libc6-compat
ENV NODE_ENV production

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

COPY --chown=app:app --from=dev /var/www/node_modules ./node_modules

COPY --chown=app:app . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force
USER app

FROM node:20-alpine as prod

WORKDIR /var/www
RUN apk add --no-cache libc6-compat

ENV NODE_ENV production

RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 app

COPY --chown=app:app --from=build /var/www/dist dist
COPY --chown=app:app --from=build /var/www/node_modules node_modules
COPY --chown=app:app --from=build /var/www/package.json package.json

USER app

CMD ["npm", "run", "start:prod"]