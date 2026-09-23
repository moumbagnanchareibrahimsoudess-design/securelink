import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from url_engine import analyze_url, detect_lookalike_domain, detect_ip_domain, detect_unusual_port
from analyzer import analyze_content


def test_url_port_sans_host():
    """Teste une URL avec port mais sans hostname : https://:8080/path"""
    result = analyze_url("https://:8080/path")
    assert result is not None
    assert result["domain"] is None
    signal_types = [s["type"] for s in result["signals"]]
    assert "malformed_url" in signal_types or "unusual_port" in signal_types


def test_url_schema_seul_https():
    """Teste 'https://' sans hôte"""
    result = analyze_url("https://")
    assert result is not None
    assert result["domain"] is None
    signal_types = [s["type"] for s in result["signals"]]
    assert "malformed_url" in signal_types


def test_url_schema_seul_http():
    """Teste 'http://' sans hôte"""
    result = analyze_url("http://")
    assert result is not None
    assert result["domain"] is None
    signal_types = [s["type"] for s in result["signals"]]
    assert "malformed_url" in signal_types


def test_url_sans_hostname():
    """Teste une URL avec seulement un chemin"""
    result = analyze_url("https:///chemin/vers/page")
    assert result is not None
    assert result["domain"] is None


def test_url_caracteres_inhabituels():
    """Teste une URL avec caractères invalides / inhabituels"""
    result = analyze_url("https://[invalid-ipv6]:99999/test")
    assert result is not None
    assert result["domain"] is None or result["domain"] == "[invalid-ipv6]"


def test_detect_lookalike_avec_none():
    """Vérifie que detect_lookalike_domain ne plante jamais quand domain est None"""
    best_domain, score = detect_lookalike_domain(None)
    assert best_domain is None
    assert score == 0.0


def test_detect_ip_domain_avec_none():
    """Vérifie que detect_ip_domain gère None sans planter"""
    assert detect_ip_domain(None) is False
    assert detect_ip_domain("") is False


def test_detect_unusual_port_avec_url_invalide():
    """Vérifie que detect_unusual_port ne plante pas sur des ports invalides"""
    assert detect_unusual_port("https://example.com:999999/") is None
    assert detect_unusual_port("pas_une_url") is None


def test_analyze_content_avec_url_malformee():
    """Vérifie que analyze_content retourne un résultat valide sans exception 500"""
    result = analyze_content("Consultez ce lien https://:8080/path immédiatement !")
    assert result is not None
    assert result["risk"] is not None
    assert result["risk"]["score"] >= 0
    assert "version" in result
