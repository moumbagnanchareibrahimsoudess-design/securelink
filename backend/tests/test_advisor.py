import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from advisor_engine import answer_question


def test_advisor_clicked():
    context = {"message": "Faux dépôt MoMo", "risk_level": "High", "risk_score": 75}
    reply = answer_question("J'ai cliqué sur le lien que dois-je faire ?", context)
    assert "Fermez immédiatement la page" in reply
    assert "code pin" in reply.lower() or "mobile money" in reply.lower()


def test_advisor_credentials_momo():
    context = {"message": "Urgent virement", "risk_level": "Critical", "risk_score": 90}
    reply = answer_question("J'ai entré mon code pin MoMo et mon mot de passe", context)
    assert "code pin" in reply.lower()
    assert "*126#" in reply or "8787" in reply or "950" in reply


def test_advisor_financial_momo():
    context = {"message": "Transfert erroné", "risk_level": "High", "risk_score": 70}
    reply = answer_question("J'ai transféré de l'argent par Orange Money suite au message", context)
    assert "renvoyez rien" in reply.lower() or "service client" in reply.lower() or "orange" in reply.lower()


def test_advisor_report_cameroon():
    reply = answer_question("Comment signaler ce numéro à l'antic ou à l'opérateur ?", {})
    assert "ANTIC" in reply or "antic" in reply.lower()
    assert "8787" in reply or "950" in reply
