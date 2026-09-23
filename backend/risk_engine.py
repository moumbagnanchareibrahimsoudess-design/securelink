signal_weights = {
    "urgency": 10,
    "money": 15,
    "sensitive_data": 25,
    "ip_domain": 10,
    "unusual_port": 5,
    "lookalike_domain": 20,
    "external_threat_detection": 30,
    "malware_url_match": 35,
    "phishing_database_match": 35,
    "malformed_url": 15,
}

RELATION_MULTIPLIER = 20

RISK_THRESHOLDS = [
    (30, "Low"),
    (70, "Medium"),
    (80, "High"),
]
DEFAULT_LEVEL = "Critical"


def get_risk_level(score):
    for threshold, level in RISK_THRESHOLDS:
        if score < threshold:
            return level
    return DEFAULT_LEVEL


def calculate_risk_score(signals, relations=None):
    relations = relations or []
    score = 0

    for signal in signals:
        weight = signal_weights.get(signal["type"], 0)
        score += weight * signal["confidence"]

    for relation in relations:
        if relation["relation"] != "unknown_relation":
            from relation_engine import relation_strength
            strength = relation_strength.get(relation["relation"], 0)
            score += strength * RELATION_MULTIPLIER

    score = min(score, 100)

    return {
        "score": score,
        "level": get_risk_level(score)
    }