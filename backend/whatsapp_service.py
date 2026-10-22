import os
import logging
import requests
from analyzer import analyze_content
from db import save_analysis

logger = logging.getLogger("securelink.whatsapp")

WHATSAPP_TOKEN = os.getenv(
    "WHATSAPP_TOKEN",
    "EAAUXAdDM37oBS4bnE1ovWj8oYmF5Kuid0yhdoABqFq2MjIZCZCbPMqvs4w88lMH079VKKwGlWFGHKClZC5Yt67EnyGv0B6ePWjBp4esvqEoswOAMZCZA0simOTcmaZBlndrouC7Y9CMOWXmI36vSN9yUI2x3jsjpOsDYjbZAtSvXZAiFpg4ip9oEdu9D9sPrBq3XLLObDmwiFv4cvBg64rhH1iOeOGtKst9DlC8vTGMLaLUradcdeMmWUcngQdMjHRI3doGa6B78SK6PNGcuMcCdJJEBZCQZDZD",
)
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "1483345801519471")
WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "securelink_verify_token_2026")

GREETING_WORDS = {
    "bonjour", "salut", "bonsoir", "hello", "hi", "aide", "help",
    "qui es-tu", "start", "menu", "info", "coucou", "yo"
}

RISK_ICONS = {
    "Critical": "🔴",
    "High": "🟠",
    "Medium": "🟡",
    "Low": "🟢",
}

RISK_LABELS_FR = {
    "Critical": "RISQUE CRITIQUE",
    "High": "RISQUE ÉLEVÉ",
    "Medium": "RISQUE MODÉRÉ",
    "Low": "RISQUE FAIBLE",
}


def verify_whatsapp_webhook(mode: str | None, token: str | None, challenge: str | None) -> str | None:
    """Valide l'authentification du Webhook demandée par Meta lors de la configuration."""
    expected_token = os.getenv("WHATSAPP_VERIFY_TOKEN", WHATSAPP_VERIFY_TOKEN)
    if mode == "subscribe" and token == expected_token:
        logger.info("Vérification du Webhook WhatsApp réussie.")
        return challenge
    logger.warning("Échec de vérification Webhook WhatsApp (token invalide : %s)", token)
    return None


def format_whatsapp_diagnosis(text: str, result: dict) -> str:
    """Formate les résultats d'analyse de SecureLink sous forme de message WhatsApp lisible et rassurant."""
    risk = result.get("risk", {})
    level = risk.get("level", "Low")
    score = risk.get("score", 0)
    actions = result.get("recommended_actions", [])
    signals = result.get("signals", [])

    icon = RISK_ICONS.get(level, "⚪")
    label = RISK_LABELS_FR.get(level, level)

    lines = [
        "🛡️ *SECURELINK — DIAGNOSTIC ANTI-FRAUDE*",
        "━━━━━━━━━━━━━━━━━━━━",
        f"{icon} *VERDICT : {label} ({score}/100)*",
        ""
    ]

    # Description selon le niveau de risque
    if level in ["Critical", "High"]:
        lines.append("⚠️ *Ce message présente de fortes caractéristiques d'escroquerie.*")
    elif level == "Medium":
        lines.append("⚠️ *Certains éléments suspects méritent une grande vigilance.*")
    else:
        lines.append("✅ *Aucune menace hostile connue n'a été détectée dans ce message.*")

    # Éléments détectés
    if signals:
        lines.append("")
        lines.append("🔍 *Éléments suspects détectés :*")
        for s in signals[:3]:
            evidence = s.get("evidence") or s.get("value")
            lines.append(f"• {evidence}")

    # Consignes d'urgence
    if actions:
        lines.append("")
        lines.append("🚨 *VOS RÉFLEXES IMMÉDIATS :*")
        for act in actions[:3]:
            lines.append(f"👉 {act}")

    # Conseils spécifiques Cameroun/Afrique si mention financière ou critique
    if level in ["Critical", "High"]:
        lines.append("")
        lines.append("📱 *Rappels Opérateurs (Cameroun) :*")
        lines.append("• MTN MoMo : Changez votre PIN via *126# ou appelez le 8787.")
        lines.append("• Orange Money : Changez votre PIN via *150# ou appelez le 950.")
        lines.append("• *Ne renvoyez JAMAIS d'argent manuellement.*")

    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━")
    lines.append("🔒 _Vos données ont été anonymisées. Pour vérifier un autre message ou lien, transférez-le ici._")

    return "\n".join(lines)


def get_welcome_message() -> str:
    """Message d'accueil lorsque l'utilisateur envoie une salutation."""
    return (
        "👋 *Bienvenue sur SecureLink !*\n"
        "Votre bouclier intelligent contre les arnaques et cyber-fraudes au Cameroun & en Afrique.\n\n"
        "📱 *Comment m'utiliser ?*\n"
        "Transférez-moi ou collez ici n'importe quel *SMS, message WhatsApp ou lien* qui vous paraît suspect :\n"
        "• Faux dépôts Mobile Money (MTN MoMo, Orange Money)\n"
        "• Faux concours de recrutement (Douanes, Police, Armée)\n"
        "• Fausses bourses d'études et arnaques de visas\n"
        "• Liens suspects ou demandes urgentes d'argent\n\n"
        "Je vous répondrai en quelques secondes avec un diagnostic clair et les réflexes d'urgence à adopter. 🛡️"
    )


def send_whatsapp_message(to_number: str, text: str) -> bool:
    """Envoie un message WhatsApp via l'API officielle Meta Cloud API."""
    token = os.getenv("WHATSAPP_TOKEN")
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

    if not token or not phone_number_id:
        logger.warning(
            "WhatsApp Token ou Phone Number ID manquant (WHATSAPP_TOKEN=%s, WHATSAPP_PHONE_NUMBER_ID=%s).",
            bool(token),
            bool(phone_number_id)
        )
        return False

    url = f"https://graph.facebook.com/v21.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": text}
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=12)
        if response.status_code >= 400:
            logger.error("Erreur API Meta WhatsApp (%s): %s", response.status_code, response.text)
            return False
        logger.info("Message WhatsApp délivré avec succès à %s", to_number)
        return True
    except Exception as e:
        logger.error("Exception lors de l'envoi WhatsApp : %s", e)
        return False


def handle_whatsapp_payload(payload: dict) -> None:
    """Traite les événements entrants du Webhook WhatsApp en tâche d'arrière-plan."""
    try:
        entries = payload.get("entry", [])
        for entry in entries:
            for change in entry.get("changes", []):
                value = change.get("value", {})
                messages = value.get("messages", [])
                for msg in messages:
                    from_number = msg.get("from")
                    msg_type = msg.get("type")

                    if not from_number:
                        continue

                    # Traitement des messages texte
                    if msg_type == "text":
                        body_text = msg.get("text", {}).get("body", "").strip()
                        if not body_text:
                            continue

                        # Vérifier si c'est une simple salutation
                        cleaned_word = body_text.lower().strip(" !?,;.")
                        if cleaned_word in GREETING_WORDS or len(body_text) < 3:
                            send_whatsapp_message(from_number, get_welcome_message())
                            continue

                        # Lancer l'analyse complète
                        result = analyze_content(body_text)

                        # Enregistrement en base de données pour la traçabilité
                        try:
                            save_analysis(
                                body_text,
                                result.get("url"),
                                result,
                                consent_for_training=False,
                            )
                        except Exception as dberr:
                            logger.warning("Échec enregistrement BDD WhatsApp : %s", dberr)

                        # Formater et envoyer le diagnostic
                        reply_text = format_whatsapp_diagnosis(body_text, result)
                        send_whatsapp_message(from_number, reply_text)

    except Exception as e:
        logger.error("Erreur générale dans handle_whatsapp_payload : %s", e)
