import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from unittest.mock import patch
from analyzer import analyze_content


def _analyze_offline(content):
    """
    Lance analyze_content en coupant l'appel aux Providers externes,
    pour tester le Core de façon rapide et sans dépendre du réseau.
    """
    with patch("analyzer.get_external_signals", return_value=[]):
        return analyze_content(content)


def test_contenu_normal():
    result = _analyze_offline(
        "Bonjour, la réunion est prévue demain à 10h. Voici le lien : https://google.com/meet"
    )
    assert result["signals"] == []
    assert result["risk"]["level"] == "Low"
    assert result["risk"]["score"] == 0


def test_message_urgent():
    result = _analyze_offline("Urgent ! Répondez immédiatement.")
    types = [s["type"] for s in result["signals"]]
    assert "urgency" in types


def test_demande_argent():
    result = _analyze_offline("Envoyez le paiement dès que possible.")
    types = [s["type"] for s in result["signals"]]
    assert "money" in types


def test_demande_otp():
    result = _analyze_offline("Merci de nous fournir votre code OTP.")
    types = [s["type"] for s in result["signals"]]
    assert "sensitive_data" in types


def test_url_lookalike():
    result = _analyze_offline("Cliquez ici : https://faceb00k.com/confirm")
    types = [s["type"] for s in result["signals"]]
    assert "lookalike_domain" in types


def test_url_port_inhabituel():
    result = _analyze_offline("Voici le lien : https://monsite.com:8080/accueil")
    types = [s["type"] for s in result["signals"]]
    assert "unusual_port" in types


def test_combinaison_signaux_critique():
    result = _analyze_offline(
        "Urgent ! Envoyez votre code OTP immédiatement pour sécuriser votre "
        "compte. Cliquez ici : https://faceb00k.com/verify"
    )
    types = [s["type"] for s in result["signals"]]
    assert "urgency" in types
    assert "sensitive_data" in types
    assert "lookalike_domain" in types
    assert result["risk"]["level"] == "Critical"
    assert len(result["relations"]) > 0


def test_provider_indisponible_ne_casse_pas_le_core():
    """
    Vérifie que le Core continue de fonctionner même si get_external_signals
    échoue ou est indisponible (règle 8 du dossier technique).
    """
    with patch("analyzer.get_external_signals", side_effect=Exception("Provider down")):
        try:
            result = analyze_content("Bonjour, comment vas-tu ?")
            assert result is not None
        except Exception:
            assert False, "Le Core ne doit jamais planter si un Provider échoue"


def test_phishtank_signal_influence_le_score():
    phishtank_signal = {
        "type": "phishing_database_match",
        "value": "known_phishing_url",
        "source": "phishtank",
        "evidence": "URL présente et vérifiée dans la base de phishing PhishTank.",
        "confidence": 0.95,
        "category": "external_reputation",
    }
    with patch("analyzer.get_external_signals", return_value=[phishtank_signal]):
        result = analyze_content("Consultez ce lien https://verified-phish.com")
        types = [s["type"] for s in result["signals"]]
        assert "phishing_database_match" in types
        assert result["risk"]["score"] >= 33
        assert result["risk"]["level"] == "Medium"
        explanation_text = " ".join(result["explanation"])
        assert "PhishTank" in explanation_text