import os
import requests
import base64
from dotenv import load_dotenv
from signal_engine import create_signal

load_dotenv()
 
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")
VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls"

def check_url_virustotal(url):
    if not VIRUSTOTAL_API_KEY:
        print("DEBUG: clé API absente ou non chargée")
        return None

    try:
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        response = requests.get(
            f"{VIRUSTOTAL_URL}/{url_id}",
            headers=headers,
            timeout=5
        )

        print("DEBUG: status_code =", response.status_code)
        print("DEBUG: response =", response.text[:500])

        if response.status_code != 200:
            return None

        data = response.json()
        stats = data["data"]["attributes"]["last_analysis_stats"]
        malicious_count = stats.get("malicious", 0)
        suspicious_count = stats.get("suspicious", 0)

        print("DEBUG: malicious =", malicious_count, "suspicious =", suspicious_count)

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
        print("DEBUG: exception =", e)
        return None
if __name__ == "__main__":
  url = input("Entrez une URL à vérifier sur VirusTotal : ")
  result = check_url_virustotal(url)
  print(result)