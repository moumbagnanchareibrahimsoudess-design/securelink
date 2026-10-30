export const EXPERT_KNOWLEDGE = {
  clicked:
    "### 🚨 Que faire immédiatement si vous avez cliqué sur le lien :\n\n" +
    "1. **Fermez immédiatement la page :** Ne remplissez aucun formulaire et ne téléchargez aucun fichier `.apk`.\n" +
    "2. **Coupez temporairement la connexion :** Désactivez vos données mobiles ou le Wi-Fi pour empêcher toute application malveillante de communiquer en arrière-plan.\n" +
    "3. **Vérifiez votre dossier Téléchargements :** Si un fichier a été téléchargé à votre insu, supprimez-le immédiatement sans l'ouvrir.\n" +
    "4. **Ne saisissez jamais votre code secret :** Aucun opérateur (Orange, MTN, Camtel) ne vous demandera votre code PIN sur une page web.\n" +
    "5. **Surveillez votre compte Mobile Money :** Vérifiez votre solde réel via le menu officiel de votre opérateur.",

  credentials:
    "### 🔐 Que faire si vous avez communiqué votre code PIN Mobile Money ou un mot de passe :\n\n" +
    "1. **Changez immédiatement votre code PIN secret :**\n" +
    "   - **MTN Mobile Money :** Composez immédiatement le `*126#` > Mon compte > Changer code PIN.\n" +
    "   - **Orange Money :** Composez immédiatement le `*150#` > Mon compte > Changer code PIN.\n" +
    "2. **Bloquez d'urgence votre compte :**\n" +
    "   - Appelez le service client MTN au **8787** ou Orange au **950** pour demander la suspension immédiate du compte avant que les fonds ne soient vidés.\n" +
    "3. **Rendez-vous dans une agence officielle :** Faites enregistrer l'incident auprès d'un agent agréé avec votre pièce d'identité.\n" +
    "4. **Rappel de sécurité :** Un véritable agent MTN ou Orange ne vous demandera **JAMAIS** votre code PIN.",

  financial:
    "### 💸 Que faire en cas de faux transfert erroné ou d'arnaque financière :\n\n" +
    "1. **En cas de prétendu « transfert erroné » (arnaque classique) :**\n" +
    "   - **NE RENVOYEZ RIEN VOUS-MÊME !** Ne composez aucun code USSD dicté par l'interlocuteur.\n" +
    "   - Vérifiez votre solde réel via le menu officiel (`*126#` ou `*150#`) : souvent l'escroc vous a envoyé un faux SMS imitant la notification sans verser un seul franc.\n" +
    "   - Dites à l'expéditeur d'initier la réclamation auprès de son opérateur (Orange ou MTN se chargera d'annuler si c'est légitime).\n" +
    "2. **Si vous avez déjà envoyé de l'argent ou des frais de dossier :**\n" +
    "   - Contactez en urgence le service client MTN (**8787**) ou Orange (**950**) avec la référence de transaction pour tenter de geler les fonds.\n" +
    "   - Déposez plainte avec les captures d'écran auprès des autorités de sécurité ou de l'**ANTIC**.",

  report:
    "### 🛡️ Comment signaler et bloquer cette tentative d'escroquerie au Cameroun :\n\n" +
    "1. **Auprès de l'ANTIC (Agence Nationale des TIC) :** Signalez le lien ou le message sur le portail officiel de l'ANTIC (**antic.cm**) ou leur centre d'alerte cybercriminalité.\n" +
    "2. **Auprès de votre opérateur téléphonique :**\n" +
    "   - **MTN Cameroun :** Signalez le numéro de l'arnaqueur au **8787**.\n" +
    "   - **Orange Cameroun :** Signalez le numéro frauduleux au **950**.\n" +
    "3. **Bloquez le contact :** Bloquez immédiatement le numéro sur votre téléphone et sur WhatsApp.\n" +
    "4. **En cas de préjudice financier avéré :** Déposez plainte auprès de la Police judiciaire (Division de la lutte contre la cybercriminalité) ou de la Gendarmerie nationale.",

  why:
    "### 🔍 Pourquoi ce contenu a été classé comme suspect :\n\n" +
    "Notre moteur d'analyse a croisé plusieurs indicateurs révélateurs du contexte local :\n" +
    "- **Pression psychologique ou fausse urgence :** Prétendu blocage de compte MoMo, fausse offre d'emploi ou alerte de transfert erroné.\n" +
    "- **Demande financière anormale :** Réclamation de « frais de dossier », « frais de déblocage » ou envoi de FCFA non justifié.\n" +
    "- **Faux lien ou nom trompeur :** Le lien ne correspond pas aux domaines officiels des opérateurs (mtn.cm, orange.cm) ou des ministères.\n" +
    "- **Réputation externe :** Croisement avec les bases de données de menaces mondiales (VirusTotal, Google Web Risk, URLhaus, PhishTank).",
};

async function callGeminiApi(
  question: string,
  context: Record<string, any>
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const prompt = `Tu es SecureLink Advisor, un assistant expert en cybersécurité et lutte contre les fraudes numériques au Cameroun et en Afrique francophone (MTN MoMo, Orange Money, fausses offres d'emploi, faux visas, fausses alertes).
Tu réponds en français à un utilisateur qui vient d'analyser un message ou un lien suspect.

Contexte de l'analyse préalable :
- Message analysé : "${context.message || "Non spécifié"}"
- URL détectée : "${context.url || "Aucune"}"
- Niveau de risque : ${context.risk_level || "Non spécifié"}
- Score de risque : ${context.risk_score || 0} / 100
- Signaux détectés : ${JSON.stringify(context.signals || [])}

Question de l'utilisateur :
"${question}"

Consignes :
1. Sois direct, rassurant et concret.
2. Adapte tes conseils au contexte camerounais/africain (Mobile Money, Orange Money 950, MTN MoMo 8787, ANTIC).
3. Donne des étapes numérotées claires.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply ? reply.trim() : null;
  } catch {
    return null;
  }
}

export async function answerQuestion(
  question: string,
  context: Record<string, any> = {}
): Promise<{ answer: string }> {
  const q = question.toLowerCase().trim();

  // 1. Essayer Gemini si configuré
  const aiReply = await callGeminiApi(question, context);
  if (aiReply) {
    return { answer: aiReply };
  }

  // 2. Moteur de connaissances expertes local contextualisé
  if (
    ["cliqué", "clique", "ouvert", "accédé", "appuyé"].some((k) =>
      q.includes(k)
    )
  ) {
    return { answer: EXPERT_KNOWLEDGE.clicked };
  }

  if (
    [
      "pin",
      "code",
      "secret",
      "mot de passe",
      "ussd",
      "*126#",
      "*150#",
      "otp",
    ].some((k) => q.includes(k))
  ) {
    return { answer: EXPERT_KNOWLEDGE.credentials };
  }

  if (
    [
      "argent",
      "transfert",
      "momo",
      "orange money",
      "dépôt",
      "fcfa",
      "cfa",
      "payé",
      "payer",
    ].some((k) => q.includes(k))
  ) {
    return { answer: EXPERT_KNOWLEDGE.financial };
  }

  if (
    [
      "signaler",
      "bloquer",
      "antic",
      "opérateur",
      "mtn",
      "orange",
      "police",
      "gendarmerie",
    ].some((k) => q.includes(k))
  ) {
    return { answer: EXPERT_KNOWLEDGE.report };
  }

  if (
    [
      "pourquoi",
      "explication",
      "comment vous savez",
      "preuve",
      "raison",
    ].some((k) => q.includes(k))
  ) {
    return { answer: EXPERT_KNOWLEDGE.why };
  }

  const riskLevel = context.risk_level || "modéré";
  return {
    answer:
      `### 🛡️ Conseil de sécurité SecureLink (Cameroun & Afrique)\n\n` +
      `L'analyse de ce contenu indique un niveau de menace **${riskLevel}**.\n\n` +
      `Précautions immédiates :\n` +
      `- **Ne partagez jamais votre code PIN Mobile Money** (MTN MoMo ou Orange Money) et ne validez aucune demande de retrait non initiée par vous.\n` +
      `- **Ne composez aucun code USSD** dicté par un inconnu au téléphone.\n` +
      `- En cas de doute sur un message de votre opérateur, contactez directement MTN au **8787** ou Orange au **950**.`,
  };
}
