# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Django + WhiteNoise (single process, port 8000)
FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# React hashed static files → collected into /static/ by WhiteNoise
COPY --from=frontend-build /app/frontend/build/static/ ./react_static/
# React index.html for SPA serving
COPY --from=frontend-build /app/frontend/build/index.html ./react_index.html

RUN python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "taskmanager.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"]
