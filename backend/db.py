import os
import psycopg2
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """
    Ouvre une nouvelle connexion à la base de données.
    connect_timeout empêche une connexion de rester bloquée
    indéfiniment si le réseau a un problème temporaire.
    L'appelant est responsable de fermer la connexion après usage.
    """
    return psycopg2.connect(DATABASE_URL, connect_timeout=5)


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
        conn.close()


def save_analysis(content, url, result):
    """
    Enregistre le résultat d'une analyse dans la base de données.
    N'est jamais appelée par le Core lui-même — uniquement par la
    couche API, après que analyze_content() a retourné son résultat.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO analyses (
                    content, url, signals, relations,
                    risk_score, risk_level, explanation, recommended_action
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                content,
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
        conn.close()


if __name__ == "__main__":
    init_db()
    print("Table 'analyses' créée (ou déjà existante).")