import os
import requests
from dotenv import load_dotenv
from signal_engine import create_signal

load_dotenv()

PHISHTANK_API_KEY = os.getenv("PHISHTANK_API_KEY")
PHISHTANK_API_URL = "https://checkurl.phishtank.com/checkurl/"


def check_url_phishtank(url):
    """
    Vérifie une URL auprès de PhishTank.
    Retourne un signal normalisé si l'URL est connue comme phishing,
    ou None si l'URL est saine, inconnue, si la clé API est absente,
    ou si le Provider est indisponible.

    NOTE: structure préparée en attendant la levée du blocage
    d'inscription PhishTank. Le format exact de la requête (paramètres,
    headers) devra être vérifié et ajusté contre la documentation
    officielle une fois l'accès obtenu.
    """
    if not PHISHTANK_API_KEY:
        return None

    try:
        params = {
            "url": url,
            "format": "json",
            "app_key": PHISHTANK_API_KEY,
        }
        response = requests.post(
            PHISHTANK_API_URL,
            data=params,
            timeout=5
        )

        if response.status_code != 200:
            return None

        data = response.json()
        results = data.get("results", {})

        if not results.get("in_database"):
            return None

        if not results.get("valid"):
            return None

        return create_signal(
            signal_type="phishing_database_match",
            signal_value="known_phishing_url",
            signal_source="phishtank",
            evidence="URL présente et vérifiée dans la base de phishing PhishTank.",
            confidence=0.95,
            category="external_reputation"
        )

    except Exception:
        return None


if __name__ == "__main__":
    url = input("Entrez une URL à vérifier sur PhishTank : ")
    result = check_url_phishtank(url)
    print(result)