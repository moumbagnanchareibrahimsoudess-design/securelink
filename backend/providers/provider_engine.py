from concurrent.futures import ThreadPoolExecutor
from providers.google_web_risk import check_url_google_web_risk
from providers.virustotal import check_url_virustotal
from providers.phishtank import check_url_phishtank
from providers.urlhaus import check_url_urlhaus


def get_external_signals(url):
    """
    Interroge tous les Providers externes en parallèle, pas en série,
    pour réduire le temps d'attente total.
    """
    if url is None:
        return []

    checks = [
        check_url_google_web_risk,
        check_url_virustotal,
        check_url_phishtank,
        check_url_urlhaus,
    ]

    signals = []
    with ThreadPoolExecutor(max_workers=len(checks)) as executor:
        futures = [executor.submit(check, url) for check in checks]
        for future in futures:
            try:
                result = future.result(timeout=10)
                if result is not None:
                    signals.append(result)
            except Exception:
                continue

    return signals