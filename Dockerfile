# Этап 1: Сборка приложения
FROM node:20-alpine as build

# Создание директории приложения
WORKDIR /usr/src/app

# Копирование файлов проекта и установка зависимостей
COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

# Копирование остальных файлов проекта
COPY . .

# Сборка приложения
RUN npm run build

# Этап 2: Создание финального образа
FROM node:20-alpine

WORKDIR /usr/src/app

# Копирование собранного приложения из предыдущего этапа
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

# Открытие порта 3000 и запуск приложения
EXPOSE 3000
CMD ["npm", "run", "start:dev"]