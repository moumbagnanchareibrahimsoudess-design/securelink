# Image Python officielle allégée
FROM python:3.13-slim

# Optimisation environnement Python en conteneur
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Installation des dépendances système légères
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code applicatif
COPY . .

# Utilisateur non-root pour les bonnes pratiques de sécurité
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Démarrage Uvicorn avec binding dynamique du port PaaS (Render, Railway, etc.)
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
