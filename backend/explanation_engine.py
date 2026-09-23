relation_explications = {
    "pressure_for_money":
    "le message combine une pression urgente avec une demande ou une promesse financiere.",
    "pressure_for_credential":
    "le message combine une pression urgente avec une demande d'informations sensibles.",
    "money_for_credential":
    "le message associe un element financier a une demande d'information sensible.",
    "pressure_for_fake_site":
    "le message combine une pression urgente avec un lien vers un site suspect.",
    "credential_harvesting":
    "le message combine une demande d'informations sensibles avec un lien vers un faux site, ce qui est un schema classique de vol d'identifiants.",
    "financial_fake_site":
    "le message combine un element financier avec un lien vers un site suspect.",
    "pressure_confirmed_threat":
    "le message combine une pression urgente avec une menace confirmee par une source externe.",
    "credential_confirmed_threat":
    "le message combine une demande d'informations sensibles avec une menace confirmee par une source externe.",
    "financial_confirmed_threat":
    "le message combine un element financier avec une menace confirmee par une source externe."
}

signal_explanations = {
    "urgency": "le message exerce une pression ou creer un sentiment d'urgence.",
    "money": "le message contient un element financier ou une demande liee a l'argent.",
    "sensitive_data": "le message ou mentionne des informations sensibles.",
    "unusual_port": "le lien utilise un port inhabituel, ce qui merite une verification.",
    "lookalike_domain": "le domain du lien ressemble fortement a celui d'un serveur connu.",
    "external_threat_detection": "l'url a ete signalee comme malveillante ou suspecte par des sources de securite externes.",
    "malware_url_match": "l'url est connue pour distribuer des logiciels malveillants.",
    "phishing_database_match": "l'url est répertoriée dans la base PhishTank comme un site de phishing avéré.",
    "malformed_url": "l'url fournie présente une syntaxe anormale ou ne contient aucun nom de domaine valide."
}


def explain_risk(signals, relations, risk):
    explanation = []

    for signal in signals:
        signal_type = signal["type"]
        if signal_type in signal_explanations:
            text = signal_explanations[signal_type]
            if text not in explanation:
                explanation.append(text)

    for relation in relations:
        relation_name = relation["relation"]
        if relation_name in relation_explications:
            text = relation_explications[relation_name]
            if text not in explanation:
                explanation.append(text)

    explanation.append(
        f"risque global : {risk['level']} (score : {risk['score']})"
    )

    return explanation