import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from advisor_engine import answer_question


def test_advisor_clicked():
    context = {"message": "Colis bloqué", "risk_level": "High", "risk_score": 75}
    reply = answer_question("J'ai cliqué sur le lien que dois-je faire ?", context)
    assert "Fermez immédiatement la page" in reply
    assert "antivirus" in reply.lower()


def test_advisor_credentials():
    context = {"message": "Urgent virement", "risk_level": "Critical", "risk_score": 90}
    reply = answer_question("J'ai entré mon mot de passe et mon identifiant", context)
    assert "mot de passe" in reply.lower()
    assert "2FA" in reply or "authentification" in reply.lower()


def test_advisor_financial():
    context = {"message": "Payer taxe", "risk_level": "High", "risk_score": 70}
    reply = answer_question("J'ai donné mes numéros de carte bancaire", context)
    assert "opposition" in reply.lower()
    assert "banque" in reply.lower()


def test_advisor_report():
    reply = answer_question("Comment signaler ce numéro et ce message ?", {})
    assert "33700" in reply
    assert "PHAROS" in reply or "pharos" in reply.lower()
