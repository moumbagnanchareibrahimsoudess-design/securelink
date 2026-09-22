import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Connexion réussie à la base Neon !")
    conn.close()
except Exception as e:
    print("Erreur de connexion :", e)