import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from providers.virustotal import check_url_virustotal
from providers.urlhaus import check_url_urlhaus


def test_virustotal_url_saine():
    result = check_url_virustotal("https://www.google.com")
    assert result is None


def test_virustotal_url_malveillante():
    result = check_url_virustotal("http://testsafebrowsing.appspot.com/s/malware.html")
    assert result is not None
    assert result["type"] == "external_threat_detection"
    assert result["category"] == "external_reputation"


def test_urlhaus_url_saine():
    result = check_url_urlhaus("https://www.google.com")
    assert result is None


def test_urlhaus_url_malveillante():
    result = check_url_urlhaus("http://105.184.177.144:55771/bin.sh")
    if result is not None:
        assert result["type"] == "malware_url_match"
        assert result["category"] == "external_reputation"
    else:
        import pytest
        pytest.skip("L'URL de test URLhaus n'est plus active dans leur base — normal, ces URLs changent souvent.")