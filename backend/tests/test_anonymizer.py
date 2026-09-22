import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from anonymizer import mask_sensitive_data


def test_mask_email():
    text = "Contactez-moi sur dupont.martin@gmail.com pour confirmer."
    masked = mask_sensitive_data(text)
    assert "dupont.martin@gmail.com" not in masked
    assert "[EMAIL MASQUÉ]" in masked


def test_mask_phone_french():
    text = "Rappelez le 06 12 34 56 78 ou le +33612345678 immédiatement."
    masked = mask_sensitive_data(text)
    assert "06 12 34 56 78" not in masked
    assert "+33612345678" not in masked
    assert "[TÉLÉPHONE MASQUÉ]" in masked


def test_mask_credit_card():
    text = "Votre carte 4970 1234 5678 9012 a été bloquée."
    masked = mask_sensitive_data(text)
    assert "4970 1234 5678 9012" not in masked
    assert "[CARTE BANCAIRE MASQUÉE]" in masked


def test_mask_iban():
    text = "Veuillez virer sur l'IBAN FR7630006000011234567890189."
    masked = mask_sensitive_data(text)
    assert "FR7630006000011234567890189" not in masked
    assert "[IBAN MASQUÉ]" in masked


def test_safe_content_unchanged():
    text = "Voici un lien suspect : https://mon-colis-suivi.com"
    masked = mask_sensitive_data(text)
    assert masked == text
