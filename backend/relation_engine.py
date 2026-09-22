from itertools import combinations


def identify_relation(category_a, category_b):
    relation = relation_rules.get(frozenset([category_a, category_b]), None)
    if relation:
        return relation
    return "unknown_relation"


relation_rules = {
    frozenset(["pressure", "financial"]): "pressure_for_money",
    frozenset(["pressure", "credential"]): "pressure_for_credential",
    frozenset(["financial", "credential"]): "money_for_credential",
    frozenset(["pressure", "technical_anomaly"]): "pressure_for_fake_site",
    frozenset(["credential", "technical_anomaly"]): "credential_harvesting",
    frozenset(["financial", "technical_anomaly"]): "financial_fake_site",
    frozenset(["pressure", "external_reputation"]): "pressure_confirmed_threat",
    frozenset(["credential", "external_reputation"]): "credential_confirmed_threat",
    frozenset(["financial", "external_reputation"]): "financial_confirmed_threat",
}

relation_strength = {
    "pressure_for_money": 0.7,
    "pressure_for_credential": 0.7,
    "money_for_credential": 0.8,
    "pressure_for_fake_site": 0.8,
    "credential_harvesting": 0.9,
    "financial_fake_site": 0.8,
    "pressure_confirmed_threat": 0.9,
    "credential_confirmed_threat": 0.95,
    "financial_confirmed_threat": 0.9,
}


def find_combinations(signals):
    relations = []
    for signal_a, signal_b in combinations(signals, 2):
        relation = {
            "signal_a": signal_a["type"],
            "category_a": signal_a["category"],
            "confidence_a": signal_a["confidence"],
            "signal_b": signal_b["type"],
            "category_b": signal_b["category"],
            "confidence_b": signal_b["confidence"],
            "relation": identify_relation(
                signal_a["category"],
                signal_b["category"],
            ),
        }
        relations.append(relation)
    return relations