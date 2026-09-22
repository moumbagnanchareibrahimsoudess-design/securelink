import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

EXPERT_KNOWLEDGE = {
    "clicked": (
        "### 🚨 Que faire immédiatement si vous avez cliqué sur le lien :\n\n"
        "1. **Fermez immédiatement la page :** Ne remplissez aucun formulaire et ne confirmez aucune autorisation.\n"
        "2. **Déconnectez-vous d'Internet brièvement :** Si un fichier a été téléchargé, coupez le Wi-Fi ou activez le mode avion pour empêcher toute communication malveillante.\n"
        "3. **Vérifiez votre dossier Téléchargements :** Supprimez immédiatement tout fichier suspect récemment arrivé (extensions `.apk`, `.exe`, `.dmg`, `.zip`).\n"
        "4. **Lancez une analyse antivirus :** Utilisez l'antivirus de votre système pour vous assurer qu'aucun logiciel espion n'a été installé.\n"
        "5. **Surveillez vos comptes :** Restez attentif aux alertes de sécurité inhabituelles sur vos emails et comptes personnels."
    ),
    "credentials": (
        "### 🔐 Que faire si vous avez saisi vos identifiants ou mots de passe :\n\n"
        "1. **Changez immédiatement votre mot de passe :** Rendez-vous directement sur le site officiel concerné (sans passer par le lien suspect) et choisissez un mot de passe robuste.\n"
        "2. **Activez l'authentification à deux facteurs (2FA) :** Activez la validation par application (ex: Google Authenticator) ou SMS pour empêcher toute intrusion.\n"
        "3. **Déconnectez les sessions actives :** Dans les paramètres de sécurité du compte, cliquez sur « Déconnecter tous les appareils ».\n"
        "4. **Si vous utilisez ce mot de passe ailleurs :** Modifiez-le immédiatement sur vos autres comptes (messageries, banque, réseaux sociaux)."
    ),
    "financial": (
        "### 💳 Que faire si vous avez communiqué vos coordonnées bancaires ou payé :\n\n"
        "1. **Faites opposition immédiatement :** Contactez d'urgence votre banque ou le numéro national d'opposition pour bloquer votre carte bancaire.\n"
        "2. **Signalez la fraude à votre établissement :** Contestez l'opération auprès de votre conseiller (procédure de rétrofacturation / remboursement).\n"
        "3. **Déposez une plainte :** Conservez des captures d'écran du message et déposez une déclaration sur la plateforme officielle (ex: THÉSÉE ou commissariat).\n"
        "4. **Surveillez vos relevés bancaires :** Vérifiez vos transactions quotidiennement pendant les prochaines semaines."
    ),
    "report": (
        "### 🛡️ Comment signaler et bloquer ce message malveillant :\n\n"
        "1. **Pour un SMS frauduleux :** Transférez le SMS gratuitement au **33700** (plateforme officielle de lutte contre les spams vocaux et SMS).\n"
        "2. **Pour un email suspect :** Marquez-le comme spam/hameçonnage et signalez-le sur **Signal-Spam** (signal-spam.fr).\n"
        "3. **Signaler le site malveillant :** Déposez un signalement sur le portail officiel de l'État : **Internet-Signalement (PHAROS)** sur cybermalveillance.gouv.fr.\n"
        "4. **Bloquez l'expéditeur :** Ajoutez le numéro ou l'adresse email à la liste des contacts indésirables sur votre appareil."
    ),
    "why": (
        "### 🔍 Pourquoi ce contenu a été classé comme suspect :\n\n"
        "Notre moteur d'analyse a croisé plusieurs indicateurs révélateurs :\n"
        "- **Pression psychologique :** L'utilisation de faux sentiment d'urgence ou d'ultimatum pour vous forcer à agir sans réfléchir.\n"
        "- **Structure du lien :** L'adresse URL ne correspond pas au domaine légitime de l'organisme officiel (usurpation d'identité, nom trompeur ou domaine récent).\n"
        "- **Bases de menaces mondiales :** Croisement avec les bases de référence (VirusTotal, Google Web Risk, URLhaus, PhishTank)."
    ),
}


def _call_gemini_api(question: str, context: dict) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = f"""Tu es SecureLink Advisor, un assistant expert en cybersécurité rassurant, clair et pédagogique.
Tu réponds en français à un utilisateur qui vient d'analyser un message ou un lien suspect.

Contexte de l'analyse préalable :
- Message ou contenu analysé : "{context.get('message', 'Non spécifié')}"
- URL détectée : "{context.get('url', 'Aucune')}"
- Niveau de risque : {context.get('risk_level', 'Non spécifié')}
- Score de risque : {context.get('risk_score', 0)} / 100
- Signaux détectés : {json.dumps(context.get('signals', []), ensure_ascii=False)}
- Recommandations initiales : {json.dumps(context.get('recommended_actions', []), ensure_ascii=False)}

Question de l'utilisateur :
"{question}"

Consignes de réponse :
1. Réponds directement, avec empathie et calme pour ne pas paniquer l'utilisateur.
2. Structure la réponse avec des étapes numérotées concrètes et des puces d'action immédiate.
3. Sois concis, clair et pratique (pas de jargon inutile).
"""
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 800},
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            candidates = res_json.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception:
        return None

    return None


def answer_question(question: str, context: dict | None = None) -> str:
    ctx = context or {}
    q = question.lower().strip()

    # 1. Si Gemini API est configurée, essayer l'IA générative
    ai_reply = _call_gemini_api(question, ctx)
    if ai_reply:
        return ai_reply

    # 2. Moteur de connaissances expertes local
    if any(k in q for k in ["cliqué", "clique", "ouvert", "accédé", "appuyé"]):
        return EXPERT_KNOWLEDGE["clicked"]

    if any(k in q for k in ["mot de passe", "identifiant", "code", "otp", "secret", "login"]):
        return EXPERT_KNOWLEDGE["credentials"]

    if any(k in q for k in ["argent", "carte", "bancaire", "virement", "payé", "payer", "somme", "euros"]):
        return EXPERT_KNOWLEDGE["financial"]

    if any(k in q for k in ["signaler", "bloquer", "pharos", "33700", "police", "gendarmerie", "porter plainte"]):
        return EXPERT_KNOWLEDGE["report"]

    if any(k in q for k in ["pourquoi", "explication", "comment vous savez", "preuve", "raison"]):
        return EXPERT_KNOWLEDGE["why"]

    # Réponse générale bienveillante
    risk_level = ctx.get("risk_level", "modéré")
    return (
        f"### 🛡️ Conseil de sécurité SecureLink\n\n"
        f"Face à ce contenu classé **{risk_level}** :\n\n"
        f"- **Ne cliquez sur aucun lien** et ne répondez pas au message suspect.\n"
        f"- **Bloquez immédiatement l'expéditeur** sur votre téléphone ou boîte mail.\n"
        f"- En cas de doute concernant votre banque ou un colis, rendez-vous toujours directement sur leur site officiel ou leur application mobile sans passer par le message reçu."
    )
