import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from analyzer import extract_url, clean_extracted_url


def test_extraction_url_avec_point_final():
    text = "Consultez https://example.com/test."
    assert extract_url(text) == "https://example.com/test"


def test_extraction_url_avec_points_suspension():
    text = "Cliquez vite ici https://example.com/urgent..."
    assert extract_url(text) == "https://example.com/urgent"


def test_extraction_url_avec_virgule():
    text = "Consultez https://example.com/info, puis validez."
    assert extract_url(text) == "https://example.com/info"


def test_extraction_url_entre_parentheses():
    text = "(veuillez vérifier sur https://example.com/login)"
    assert extract_url(text) == "https://example.com/login"


def test_extraction_url_avec_parenthese_dans_path():
    # Exemple Wikipedia : parenthèses valides dans le chemin de l'URL
    text = "Voir https://en.wikipedia.org/wiki/Phishing_(security) pour plus de détails."
    assert extract_url(text) == "https://en.wikipedia.org/wiki/Phishing_(security)"


def test_extraction_url_parenthese_path_dans_phrase_parenthesee():
    # URL avec parenthèse interne, elle-même entourée de parenthèses de phrase
    text = "(source : https://en.wikipedia.org/wiki/Phishing_(security))"
    assert extract_url(text) == "https://en.wikipedia.org/wiki/Phishing_(security)"


def test_extraction_url_avec_query_fragment_et_port():
    text = "Vérifiez : https://secure.example.com:8443/auth?token=abc123_xyz&step=2#section!"
    assert extract_url(text) == "https://secure.example.com:8443/auth?token=abc123_xyz&step=2#section"


def test_extraction_url_avec_guillemets():
    text = "Allez sur \"https://example.com/portal\" tout de suite."
    assert extract_url(text) == "https://example.com/portal"


def test_extraction_sans_url():
    text = "Bonjour, ceci est un simple message sans aucun lien web."
    assert extract_url(text) is None
