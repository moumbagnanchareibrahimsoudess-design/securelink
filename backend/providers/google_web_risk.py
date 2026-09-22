import os
import requests
from dotenv import load_dotenv
from signal_engine import create_signal

load_dotenv()

GOOGLE_WEB_RISK_API_KEY = os.getenv("GOOGLE_WEB_RISK_API_KEY")
GOOGLE_WEB_RISK_URL = "https://webrisk.googleapis.com/v1/uris:search"


def check_url_google_web_risk(url):
    """
    Vérifie une URL auprès de Google Web Risk.
    Retourne un signal normalisé si l'URL est présente dans les listes
    de menaces Google, ou None si l'URL est saine, si la clé API est
    absente, ou si le Provider est indisponible.

    NOTE: structure préparée en attendant l'activation d'un compte
    Google Cloud avec facturation. Le format exact de la requête
    devra être revérifié contre la documentation officielle au moment
    de l'activation.
    """
    if not GOOGLE_WEB_RISK_API_KEY:
        return None

    try:
        params = {
            "key": GOOGLE_WEB_RISK_API_KEY,
            "uri": url,
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        }
        response = requests.get(
            GOOGLE_WEB_RISK_URL,
            params=params,
            timeout=5
        )

        if response.status_code != 200:
            return None

        data = response.json()
        threat = data.get("threat")

        if not threat:
            return None

        threat_types = threat.get("threatTypes", [])

        return create_signal(
            signal_type="external_threat_detection",
            signal_value="malicious_url",
            signal_source="google_web_risk",
            evidence=f"URL présente dans une liste de menace Google ({', '.join(threat_types)}).",
            confidence=0.95,
            category="external_reputation"
        )

    except Exception:
        return None


if __name__ == "__main__":
    url = input("Entrez une URL à vérifier sur Google Web Risk : ")
    result = check_url_google_web_risk(url)
    print(result)