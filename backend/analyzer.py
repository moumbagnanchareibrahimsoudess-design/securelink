import re
from message_engine import analyse_message
from url_engine import analyze_url
from relation_engine import find_combinations
from risk_engine import calculate_risk_score
from explanation_engine import explain_risk
from recommended_action import get_recommended_action, get_recommended_actions
from providers.provider_engine import get_external_signals

 


def extract_url(content):
    match = re.search(r"https?://[^\s]+", content)
    if match:
        return match.group(0)
    return None

def analyze_content(content):
    message_result = analyse_message(content)
    signals = list(message_result["signals"])

    url = extract_url(content)
    if url:
        url_result = analyze_url(url)
        signals.extend(url_result["signals"])

        external_signals = get_external_signals(url)      # <-- ajouté
        signals.extend(external_signals)                   # <-- ajouté

    all_relations = find_combinations(signals)
    meaningful_relations = [
        r for r in all_relations if r["relation"] != "unknown_relation"
    ]

    risk = calculate_risk_score(signals, all_relations)
    risk["score"] = round(risk["score"], 1)

    explanation = explain_risk(signals, meaningful_relations, risk)
    recommended_action = get_recommended_action(risk, signals, meaningful_relations)
    recommended_actions = get_recommended_actions(risk, signals, meaningful_relations)

    return {
        "version": "1.0",
        "message": content,
        "url": url,
        "signals": signals,
        "relations": meaningful_relations,
        "risk": risk,
        "explanation": explanation,
        "recommended_action": recommended_action,
        "recommended_actions": recommended_actions
    }
if __name__ == "__main__":
    content = input("Entrez un contenu à analyser : ")
    result = analyze_content(content)
    print(result)