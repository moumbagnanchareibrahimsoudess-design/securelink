import os
import json
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv
from anonymizer import mask_sensitive_data

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

_connection_pool = None


def get_pool():
    """
    Initialise ou retourne le pool de connexions thread-safe (1 à 10 connexions réutilisables).
    Évite d'ouvrir et fermer une connexion TCP+SSL à chaque analyse.
    """
    global _connection_pool
    if _connection_pool is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL non configurée dans l'environnement.")
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL,
            connect_timeout=5,
        )
    return _connection_pool


def close_pool():
    """
    Ferme proprement toutes les connexions actives du pool à l'arrêt de l'application.
    """
    global _connection_pool
    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None


def get_connection():
    """
    Emprunte une connexion déjà ouverte depuis le pool.
    L'appelant DOIT impérativement la restituer via release_connection(conn).
    """
    p = get_pool()
    return p.getconn()


def release_connection(conn):
    """
    Restitue la connexion au pool pour réutilisation immédiate.
    """
    if _connection_pool is not None and conn is not None:
        _connection_pool.putconn(conn)


def init_db():
    """
    Crée la table 'analyses' si elle n'existe pas déjà.
    Idempotent : peut être appelée plusieurs fois sans risque.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS analyses (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    url TEXT,
                    signals JSONB NOT NULL,
                    relations JSONB NOT NULL,
                    risk_score FLOAT NOT NULL,
                    risk_level TEXT NOT NULL,
                    explanation JSONB NOT NULL,
                    recommended_action TEXT NOT NULL,
                    consent_for_training BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """)
        conn.commit()
    finally:
        release_connection(conn)


def save_analysis(content, url, result):
    """
    Enregistre le résultat d'une analyse dans la base de données.
    Anonymise automatiquement les données personnelles (RGPD) avant stockage.
    """
    conn = get_connection()
    try:
        # Filtrage RGPD préalable : masquage des téléphones, emails et données bancaires
        safe_content = mask_sensitive_data(content)

        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO analyses (
                    content, url, signals, relations,
                    risk_score, risk_level, explanation, recommended_action
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                safe_content,
                url,
                json.dumps(result["signals"]),
                json.dumps(result["relations"]),
                result["risk"]["score"],
                result["risk"]["level"],
                json.dumps(result["explanation"]),
                result["recommended_action"],
            ))
        conn.commit()
    finally:
        release_connection(conn)


if __name__ == "__main__":
    init_db()
    print("Base de données initialisée avec succès avec le pool de connexions.")