import os
import logging
import base64
import requests
from dotenv import load_dotenv
from signal_engine import create_signal

load_dotenv()

logger = logging.getLogger("securelink.virustotal")

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls"


def check_url_virustotal(url):
    """
    Vérifie une URL auprès de l'API VirusTotal v3.
    Retourne un signal normalisé si l'URL est signalée malveillante ou suspecte,
    ou None si l'URL est saine, inconnue, si la clé est absente, ou en cas d'erreur.
    """
    if not VIRUSTOTAL_API_KEY:
        logger.debug("VirusTotal: clé API absente ou non configurée, vérification ignorée.")
        return None

    try:
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        response = requests.get(
            f"{VIRUSTOTAL_URL}/{url_id}",
            headers=headers,
            timeout=5
        )

        if response.status_code != 200:
            logger.debug("VirusTotal: code réponse HTTP %s pour l'URL demandée", response.status_code)
            return None

        data = response.json()
        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)

        if malicious_count == 0 and suspicious_count == 0:
            return None

        confidence = min(0.5 + (malicious_count + suspicious_count) * 0.05, 0.99)

        return create_signal(
            signal_type="external_threat_detection",
            signal_value="suspicious_url",
            signal_source="virustotal",
            evidence=f"{malicious_count} moteur(s) signalent cette URL comme malveillante, {suspicious_count} comme suspecte.",
            confidence=confidence,
            category="external_reputation"
        )

    except Exception as e:
        logger.warning("VirusTotal: exception lors de l'appel (%s)", type(e).__name__)
        return None


if __name__ == "__main__":
    url = input("Entrez une URL à vérifier sur VirusTotal : ")
    result = check_url_virustotal(url)
    print(result)