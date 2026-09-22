from ast import And
import ipaddress   
from unittest import signals
from urllib.parse import urlparse
from signal_engine import create_signal
from technical_knowledge import TECHNICAL_KNOWLEDGE
from domain_knowledge import domain_knowledge


def detect_ip_domain(url):
    try:
        ip = ipaddress.ip_address(url)
        return True
    except  ValueError:
        return False 
def detect_unusual_port(url):
    parsed = urlparse(url)
    if parsed.port is not None and parsed.port not in [80,443]:
        return parsed.port
    return None
def get_known_domain():
    return domain_knowledge["known_domains"]
def similarity_score(domain_a, domain_b):
    domain_a = domain_a.lower()
    domain_b = domain_b.lower()
    if domain_a == domain_b:
        return 1.0
    max_length = max(len(domain_a), len(domain_b))
    if max_length == 0:
        return 1.0
    differences =sum(1 for a, b in zip(domain_a, domain_b) if a != b)
    return 1 - (differences / max_length)
def detect_lookalike_domain(domain):
    known_domains = get_known_domain()

    best_domain = None
    best_score = 0.0
    for known_domain in known_domains:
        score = similarity_score(domain, known_domain)
        if score > best_score:
            best_score = score
            best_domain = known_domain
    
    return  best_domain, best_score

def analyze_url(url):
    parsed = urlparse(url)
    domain = parsed.hostname
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

    return {
        "url": url,
        "scheme": parsed.scheme,
        "domain": domain,
        "path": parsed.path,
        "query": parsed.query,
        "is_ip_domain": detect_ip_domain(domain),
        "signals": signals
    }
    
if __name__ == "__main__":
    url = input("Entrez une URL à analyser : ")
    result = analyze_url(url)
    print(result)
    print(detect_unusual_port(url))
    print(get_known_domain())
    print(similarity_score("google.com", "go0gle.com"))
    print(detect_lookalike_domain("go0gle.com"))
    print(similarity_score("faceb00k.com", "facebook.com"))
    print(detect_lookalike_domain("faceb00k.com"))
    