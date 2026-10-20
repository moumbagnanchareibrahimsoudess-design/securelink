import ipaddress
from urllib.parse import urlparse
from signal_engine import create_signal
from domain_knowledge import domain_knowledge


def detect_ip_domain(domain):
    if not domain:
        return False
    try:
        ipaddress.ip_address(domain)
        return True
    except (ValueError, TypeError, Exception):
        return False


def detect_unusual_port(url):
    try:
        parsed = urlparse(url)
        if parsed.port is not None and parsed.port not in [80, 443]:
            return parsed.port
    except Exception:
        return None
    return None


def get_known_domain():
    return domain_knowledge.get("known_domains", [])


def similarity_score(domain_a, domain_b):
    if not domain_a or not domain_b:
        return 0.0
    domain_a = str(domain_a).lower()
    domain_b = str(domain_b).lower()
    if domain_a == domain_b:
        return 1.0
    max_length = max(len(domain_a), len(domain_b))
    if max_length == 0:
        return 1.0
    differences = sum(1 for a, b in zip(domain_a, domain_b) if a != b) + abs(len(domain_a) - len(domain_b))
    return max(0.0, 1 - (differences / max_length))


def detect_lookalike_domain(domain):
    if not domain:
        return None, 0.0
    known_domains = get_known_domain()

    best_domain = None
    best_score = 0.0
    for known_domain in known_domains:
        score = similarity_score(domain, known_domain)
        if score > best_score:
            best_score = score
            best_domain = known_domain

    return best_domain, best_score


def analyze_url(url):
    if not url:
        return {
            "url": "",
            "scheme": "",
            "domain": None,
            "path": "",
            "query": "",
            "is_ip_domain": False,
            "signals": []
        }

    try:
        parsed = urlparse(url)
        domain = parsed.hostname
        scheme = parsed.scheme or ""
        path = parsed.path or ""
        query = parsed.query or ""
    except Exception:
        parsed = None
        domain = None
        scheme = ""
        path = ""
        query = ""

    signals = []

    unusual_port = detect_unusual_port(url)
    if unusual_port is not None:
        signals.append(create_signal(
            signal_type="unusual_port",
            signal_value=str(unusual_port),
            signal_source="url",
            evidence=f"l'url utilise un port inhabituel :{unusual_port}.",
            confidence=0.8,
            category="technical_anomaly"
        ))

    if not domain:
        signals.append(create_signal(
            signal_type="malformed_url",
            signal_value=url,
            signal_source="url",
            evidence="L'URL est malformée ou ne contient aucun nom d'hôte valide.",
            confidence=0.8,
            category="technical_anomaly"
        ))
        return {
            "url": url,
            "scheme": scheme,
            "domain": None,
            "path": path,
            "query": query,
            "is_ip_domain": False,
            "signals": signals
        }

    if detect_ip_domain(domain):
        signals.append(create_signal(
            signal_type="ip_domain",
            signal_value=domain,
            signal_source="url",
            evidence=f"L'URL contient un domaine IP : {domain}.",
            confidence=0.9,
            category="technical_anomaly"
        ))

    lookalike_domain, similarity = detect_lookalike_domain(domain)
    if (
        lookalike_domain is not None
        and similarity > 0.8
        and domain != lookalike_domain
    ):
        signals.append(create_signal(
            signal_type="lookalike_domain",
            signal_value=lookalike_domain,
            signal_source="url",
            evidence=f"L'URL contient un domaine ressemblant à un domaine connu : {lookalike_domain} ({similarity:.2f}).",
            confidence=similarity,
            category="technical_anomaly"
        ))
    else:
        brand_patterns = domain_knowledge.get("brand_patterns", {})
        lower_domain = domain.lower()
        for brand, official_domains in brand_patterns.items():
            if brand in lower_domain:
                is_official = any(
                    lower_domain == od or lower_domain.endswith("." + od)
                    for od in official_domains
                )
                if not is_official:
                    signals.append(create_signal(
                        signal_type="lookalike_domain",
                        signal_value=f"impersonation_{brand}",
                        signal_source="url",
                        evidence=f"L'URL utilise la marque ou le service '{brand.upper()}' sur un domaine non officiel ({domain}).",
                        confidence=0.95,
                        category="technical_anomaly"
                    ))
                    break

    return {
        "url": url,
        "scheme": scheme,
        "domain": domain,
        "path": path,
        "query": query,
        "is_ip_domain": detect_ip_domain(domain),
        "signals": signals
    }


if __name__ == "__main__":
    test_urls = [
        "https://:8080/path",
        "https://",
        "http://",
        "https://google.com",
        "https://faceb00k.com",
    ]
    for u in test_urls:
        print(u, "->", analyze_url(u))