import os
import requests
from dotenv import load_dotenv
from signal_engine import create_signal

load_dotenv()

URLHAUS_API_KEY = os.getenv("URLHAUS_API_KEY")
URLHAUS_API_URL = "https://urlhaus-api.abuse.ch/v1/url/"


def check_url_urlhaus(url):
    if not URLHAUS_API_KEY:
        return None

    try:
        headers = {"Auth-Key": URLHAUS_API_KEY}
        response = requests.post(
            URLHAUS_API_URL,
            data={"url": url},
            headers=headers,
            timeout=5
        )

        if response.status_code != 200:
            return None

        data = response.json()

        if data.get("query_status") != "ok":
            return None

        threat = data.get("threat", "malware_download")
        url_status = data.get("url_status", "unknown")

        return create_signal(
            signal_type="malware_url_match",
            signal_value="known_malware_url",
            signal_source="urlhaus",
            evidence=f"URL associée à la distribution de malware (statut : {url_status}, menace : {threat}).",
            confidence=0.95,
            category="external_reputation"
        )

    except Exception:
        return None


if __name__ == "__main__":
    url = input("Entrez une URL à vérifier sur URLhaus : ")
    result = check_url_urlhaus(url)
    print(result)