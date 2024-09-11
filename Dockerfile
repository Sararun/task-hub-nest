FROM node:20-alpine AS dev

WORKDIR /app

COPY --link package*.json .env ./
RUN npm ci --no-audit

FROM node:20-alpine as build

WORKDIR /app

COPY --link --from=dev /app/node_modules ./node_modules

COPY --link . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine as prod

WORKDIR /app

COPY --link --from=build /app/dist dist
COPY --link --from=build /app/node_modules node_modules
COPY --link --from=build /app/package.json package.json
COPY --link --from=build /app/prisma prisma
COPY --link . .

EXPOSE 3000

CMD ["npm", "run", "start:migrate:dev"]
