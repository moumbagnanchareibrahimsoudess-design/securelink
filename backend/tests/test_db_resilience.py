import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from unittest.mock import patch
from starlette.requests import Request
from main import analyze, AnalyzeRequest


def test_db_failure_does_not_block_analyze():
    """
    Vérifie qu'un échec de la base de données (timeout, connexion coupée)
    ne fait pas planter l'API et retourne quand même le résultat d'analyse.
    """
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/analyze",
        "headers": [],
        "client": ("127.0.0.1", 12345),
    }
    req = Request(scope)
    body = AnalyzeRequest(content="Bonjour, message de test", consent_for_training=True)
    with patch("main.save_analysis", side_effect=Exception("Neon DB connection refused")):
        result = analyze(req, body)
        assert result is not None
        assert "risk" in result
        assert "signals" in result
        assert "explanation" in result
