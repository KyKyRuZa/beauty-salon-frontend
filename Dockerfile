# syntax=docker/dockerfile:1

# =============================================================================
# Frontend Dockerfile (Production)
# =============================================================================
# Multi-stage сборка для минимального размера образа
# Stage 1: Сборка React приложения
# Stage 2: Nginx для раздачи статики
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:24-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование package файлов для кэширования зависимостей
COPY package*.json ./

# Установка зависимостей (включая devDependencies для сборки)
RUN npm ci

# Копирование исходного кода
COPY . .

# Аргументы для build-time переменных (опционально)
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}

# Сборка приложения
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production (Nginx)
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Метки для идентификации образа
LABEL maintainer="Beauty Vite Team"
LABEL description="Frontend static server for Beauty Vite application"
LABEL version="1.0"

# Установка рабочей директории
WORKDIR /usr/share/nginx/html

# Копирование конфигурации Nginx с security headers
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранного приложения из builder stage
COPY --from=builder /app/dist .

# Создание непривилегированного пользователя для безопасности
# UID 1001 выбран для совместимости с стандартными non-root пользователями
RUN adduser -D -u 1001 nginx-user && \
    # Назначение прав на директорию с файлами
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    # Назначение прав на кэш nginx
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    # Назначение прав на логи
    chown -R nginx-user:nginx-user /var/log/nginx && \
    # Создание PID файла с правильными правами
    touch /var/run/nginx.pid && \
    chown nginx-user:nginx-user /var/run/nginx.pid

# Настройка read-only root filesystem
# Nginx будет писать только в /var/cache/nginx и /var/log/nginx (через volumes)

# Переключение на непривилегированного пользователя
USER nginx-user

# Порт для экспозиции
EXPOSE 80

# Healthcheck для проверки доступности
# Используется wget (встроен в alpine) вместо curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Сигнал для корректной остановки
STOPSIGNAL SIGQUIT

# Запуск Nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]
