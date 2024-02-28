FROM node:20-alpine AS dev

WORKDIR /var/www

COPY --link package*.json .env ./
RUN npm ci --no-audit

FROM node:20-alpine as build

WORKDIR /var/www

COPY --link --from=dev /var/www/node_modules ./node_modules

COPY --link . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine as prod

WORKDIR /var/www

COPY --link --from=build /var/www/dist dist
COPY --link --from=build /var/www/node_modules node_modules
COPY --link --from=build /var/www/package.json package.json
COPY --link --from=build /var/www/prisma prisma

CMD ["npm", "run", "start:migrate:prod"]
