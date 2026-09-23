import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv()

EXPERT_KNOWLEDGE = {
    "clicked": (
        "### 🚨 Que faire immédiatement si vous avez cliqué sur le lien :\n\n"
        "1. **Fermez immédiatement la page :** Ne remplissez aucun formulaire et ne téléchargez aucun fichier `.apk`.\n"
        "2. **Coupez temporairement la connexion :** Désactivez vos données mobiles ou le Wi-Fi pour empêcher toute application malveillante de communiquer en arrière-plan.\n"
        "3. **Vérifiez votre dossier Téléchargements :** Si un fichier a été téléchargé à votre insu, supprimez-le immédiatement sans l'ouvrir.\n"
        "4. **Ne saisissez jamais votre code secret :** Aucun opérateur (Orange, MTN, Camtel) ne vous demandera votre code PIN sur une page web.\n"
        "5. **Surveillez votre compte Mobile Money :** Vérifiez votre solde réel via le menu officiel de votre opérateur."
    ),
    "credentials": (
        "### 🔐 Que faire si vous avez communiqué votre code PIN Mobile Money ou un mot de passe :\n\n"
        "1. **Changez immédiatement votre code PIN secret :**\n"
        "   - **MTN Mobile Money :** Composez immédiatement le `*126#` > Mon compte > Changer code PIN.\n"
        "   - **Orange Money :** Composez immédiatement le `*150#` > Mon compte > Changer code PIN.\n"
        "2. **Bloquez d'urgence votre compte :**\n"
        "   - Appelez le service client MTN au **8787** ou Orange au **950** pour demander la suspension immédiate du compte avant que les fonds ne soient vidés.\n"
        "3. **Rendez-vous dans une agence officielle :** Faites enregistrer l'incident auprès d'un agent agréé avec votre pièce d'identité.\n"
        "4. **Rappel de sécurité :** Un véritable agent MTN ou Orange ne vous demandera **JAMAIS** votre code PIN."
    ),
    "financial": (
        "### 💸 Que faire en cas de faux transfert erroné ou d'arnaque financière :\n\n"
        "1. **En cas de prétendu « transfert erroné » (arnaque classique) :**\n"
        "   - **NE RENVOYEZ RIEN VOUS-MÊME !** Ne composez aucun code USSD dicté par l'interlocuteur.\n"
        "   - Vérifiez votre solde réel via le menu officiel (`*126#` ou `*150#`) : souvent l'escroc vous a envoyé un faux SMS imitant la notification sans verser un seul franc.\n"
        "   - Dites à l'expéditeur d'initier la réclamation auprès de son opérateur (Orange ou MTN se chargera d'annuler si c'est légitime).\n"
        "2. **Si vous avez déjà envoyé de l'argent ou des frais de dossier :**\n"
        "   - Contactez en urgence le service client MTN (**8787**) ou Orange (**950**) avec la référence de transaction pour tenter de geler les fonds.\n"
        "   - Déposez plainte avec les captures d'écran auprès des autorités de sécurité ou de l'**ANTIC**."
    ),
    "report": (
        "### 🛡️ Comment signaler et bloquer cette tentative d'escroquerie au Cameroun :\n\n"
        "1. **Auprès de l'ANTIC (Agence Nationale des TIC) :** Signalez le lien ou le message sur le portail officiel de l'ANTIC (**antic.cm**) ou leur centre d'alerte cybercriminalité.\n"
        "2. **Auprès de votre opérateur téléphonique :**\n"
        "   - **MTN Cameroun :** Signalez le numéro de l'arnaqueur au **8787**.\n"
        "   - **Orange Cameroun :** Signalez le numéro frauduleux au **950**.\n"
        "3. **Bloquez le contact :** Bloquez immédiatement le numéro sur votre téléphone et sur WhatsApp.\n"
        "4. **En cas de préjudice financier avéré :** Déposez plainte auprès de la Police judiciaire (Division de la lutte contre la cybercriminalité) ou de la Gendarmerie nationale."
    ),
    "why": (
        "### 🔍 Pourquoi ce contenu a été classé comme suspect :\n\n"
        "Notre moteur d'analyse a croisé plusieurs indicateurs révélateurs du contexte local :\n"
        "- **Pression psychologique ou fausse urgence :** Prétendu blocage de compte MoMo, fausse offre d'emploi ou alerte de transfert erroné.\n"
        "- **Demande financière anormale :** Réclamation de « frais de dossier », « frais de déblocage » ou envoi de FCFA non justifié.\n"
        "- **Faux lien ou nom trompeur :** Le lien ne correspond pas aux domaines officiels des opérateurs (mtn.cm, orange.cm) ou des ministères.\n"
        "- **Réputation externe :** Croisement avec les bases de données de menaces mondiales (VirusTotal, Google Web Risk, URLhaus, PhishTank)."
    ),
}


def _call_gemini_api(question: str, context: dict) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = f"""Tu es SecureLink Advisor, un assistant expert en cybersécurité et lutte contre les fraudes numériques au Cameroun et en Afrique francophone (MTN MoMo, Orange Money, fausses offres d'emploi, faux visas, fausses alertes).
Tu réponds en français à un utilisateur qui vient d'analyser un message ou un lien suspect.

Contexte de l'analyse préalable :
- Message analysé : "{context.get('message', 'Non spécifié')}"
- URL détectée : "{context.get('url', 'Aucune')}"
- Niveau de risque : {context.get('risk_level', 'Non spécifié')}
- Score de risque : {context.get('risk_score', 0)} / 100
- Signaux détectés : {json.dumps(context.get('signals', []), ensure_ascii=False)}

Question de l'utilisateur :
"{question}"

Consignes :
1. Sois rassurant, direct et concret.
2. Adapte tes conseils au contexte camerounais/africain (Mobile Money, Orange Money 950, MTN MoMo 8787, ANTIC).
3. Donne des étapes numérotées claires.
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

    # 2. Moteur de connaissances expertes local contextualisé
    if any(k in q for k in ["cliqué", "clique", "ouvert", "accédé", "appuyé"]):
        return EXPERT_KNOWLEDGE["clicked"]

    if any(k in q for k in ["pin", "code", "secret", "mot de passe", "ussd", "*126#", "*150#", "otp"]):
        return EXPERT_KNOWLEDGE["credentials"]

    if any(k in q for k in ["argent", "transfert", "momo", "orange money", "dépôt", "fcfa", "cfa", "payé", "payer"]):
        return EXPERT_KNOWLEDGE["financial"]

    if any(k in q for k in ["signaler", "bloquer", "antic", "opérateur", "mtn", "orange", "police", "gendarmerie"]):
        return EXPERT_KNOWLEDGE["report"]

    if any(k in q for k in ["pourquoi", "explication", "comment vous savez", "preuve", "raison"]):
        return EXPERT_KNOWLEDGE["why"]

    risk_level = ctx.get("risk_level", "modéré")
    return (
        f"### 🛡️ Conseil de sécurité SecureLink (Cameroun & Afrique)\n\n"
        f"L'analyse de ce contenu indique un niveau de menace **{risk_level}**.\n\n"
        f"Précautions immédiates :\n"
        f"- **Ne partagez jamais votre code PIN Mobile Money** (MTN MoMo ou Orange Money) et ne validez aucune demande de retrait non initiée par vous.\n"
        f"- **Ne composez aucun code USSD** dicté par un inconnu au téléphone.\n"
        f"- En cas de doute sur un message de votre opérateur, contactez directement MTN au **8787** ou Orange au **950**."
    )
