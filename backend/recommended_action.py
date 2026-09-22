recommended_actions = {
    "Low": "Aucune menace importante détectée. Restez attentif.",
    "Medium": "Vérifiez les éléments suspects avant d'agir.",
    "High": "Évitez toute action avant vérification approfondie.",
    "Critical": "Ne cliquez sur aucun lien et ne transmettez aucune information sensible."
}


def get_recommended_action(risk, signals=None, relations=None):
    """
    Retourne l'action recommandée en fonction du niveau de risque.
    """
    return recommended_actions.get(
        risk["level"],
        "Niveau de risque inconnu — vérifiez manuellement."
    )


def get_recommended_actions(risk, signals, relations=None):
    """
    Retourne une liste d'actions concrètes, adaptées au niveau de risque
    ET aux signaux précis détectés — pas seulement au score global.
    """
    actions = []

    level = risk["level"]

    if level == "Low":
        actions.append("Aucune action nécessaire pour le moment.")
        actions.append("Restez attentif à toute demande inhabituelle.")
    elif level == "Medium":
        actions.append("Vérifiez les éléments suspects avant d'agir.")
        actions.append("Ne transmettez aucune information sensible sans confirmation.")
    elif level == "High":
        actions.append("Évitez toute action avant vérification approfondie.")
        actions.append("Ne cliquez sur aucun lien tant que la source n'est pas confirmée.")
    else:  # Critical
        actions.append("Ne cliquez sur aucun lien.")
        actions.append("Ne transmettez aucune information sensible.")

    signal_types = {s["type"] for s in signals}

    if "sensitive_data" in signal_types:
        actions.append("Ne transmettez jamais votre code ou mot de passe par ce biais.")

    if signal_types & {"lookalike_domain", "external_threat_detection", "malware_url_match"}:
        actions.append("Vérifiez l'adresse du site officiel directement, sans passer par ce lien.")

    if "money" in signal_types:
        actions.append("Ne procédez à aucun paiement tant que l'expéditeur n'est pas vérifié.")

    seen = set()
    unique_actions = []
    for action in actions:
        if action not in seen:
            seen.add(action)
            unique_actions.append(action)

    return unique_actions