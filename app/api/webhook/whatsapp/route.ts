import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || "securelink_verify_token_2026";

const WHATSAPP_TOKEN =
  process.env.WHATSAPP_TOKEN ||
  "EAAUXAdDM37oBS4bnE1ovWj8oYmF5Kuid0yhdoABqFq2MjIZCZCbPMqvs4w88lMH079VKKwGlWFGHKClZC5Yt67EnyGv0B6ePWjBp4esvqEoswOAMZCZA0simOTcmaZBlndrouC7Y9CMOWXmI36vSN9yUI2x3jsjpOsDYjbZAtSvXZAiFpg4ip9oEdu9D9sPrBq3XLLObDmwiFv4cvBg64rhH1iOeOGtKst9DlC8vTGMLaLUradcdeMmWUcngQdMjHRI3doGa6B78SK6PNGcuMcCdJJEBZCQZDZD";

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID || "1483345801519471";

const SECURELINK_DEFAULT_KEY =
  process.env.SECURELINK_API_KEY || "00e86441555c7d489f8c3c0e6cf66e6d95e3f003741bceb08c8835d7f84971c6";

const GREETINGS = new Set([
  "bonjour",
  "salut",
  "bonsoir",
  "hello",
  "hi",
  "aide",
  "help",
  "qui es-tu",
  "start",
  "menu",
  "info",
  "coucou",
  "yo",
]);

const RISK_ICONS: Record<string, string> = {
  Critical: "🔴",
  High: "🟠",
  Medium: "🟡",
  Low: "🟢",
};

const RISK_LABELS_FR: Record<string, string> = {
  Critical: "RISQUE CRITIQUE",
  High: "RISQUE ÉLEVÉ",
  Medium: "RISQUE MODÉRÉ",
  Low: "RISQUE FAIBLE",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Échec de vérification du Webhook" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Traitement asynchrone pour répondre à Meta sous 3 secondes
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") {
      return NextResponse.json({ status: "ok" });
    }

    const fromNumber = message.from;
    const textBody = (message.text?.body || "").trim();

    if (!fromNumber || !textBody) {
      return NextResponse.json({ status: "ok" });
    }

    const cleaned = textBody.toLowerCase().replace(/[!?,;.]/g, "").trim();

    // 1. Salutation simple
    if (GREETINGS.has(cleaned) || textBody.length < 3) {
      const welcome =
        "👋 *Bienvenue sur SecureLink !*\n" +
        "Votre bouclier intelligent contre les arnaques et cyber-fraudes au Cameroun & en Afrique.\n\n" +
        "📱 *Comment m'utiliser ?*\n" +
        "Transférez-moi ou collez ici n'importe quel *SMS, message WhatsApp ou lien* suspect :\n" +
        "• Faux dépôts Mobile Money (MTN MoMo, Orange Money)\n" +
        "• Faux recrutements (Douanes, Police, Armée)\n" +
        "• Fausses bourses d'études et visas\n" +
        "• Liens suspects ou demandes d'argent\n\n" +
        "Je vous répondrai en 2 secondes avec un diagnostic clair et les réflexes d'urgence. 🛡️";

      await sendWhatsApp(fromNumber, welcome);
      return NextResponse.json({ status: "ok" });
    }

    // 2. Appel de l'analyseur
    const backendUrl = (process.env.SECURELINK_API_URL || "https://securelink-production-3189.up.railway.app").replace(/\/$/, "");
    let analysisResult: any = null;

    try {
      const res = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SECURELINK_DEFAULT_KEY,
        },
        body: JSON.stringify({ content: textBody }),
      });

      if (res.ok) {
        analysisResult = await res.json();
      }
    } catch (err) {
      console.error("Erreur appel backend analyze:", err);
    }

    if (!analysisResult) {
      await sendWhatsApp(
        fromNumber,
        "⚠️ *SecureLink :* Une erreur temporaire est survenue lors de l'analyse. Veuillez renvoyer votre message dans un instant."
      );
      return NextResponse.json({ status: "ok" });
    }

    // 3. Formatage de la réponse WhatsApp
    const risk = analysisResult.risk || {};
    const level = risk.level || "Low";
    const score = risk.score || 0;
    const icon = RISK_ICONS[level] || "⚪";
    const label = RISK_LABELS_FR[level] || level;
    const actions = analysisResult.recommended_actions || [];
    const signals = analysisResult.signals || [];

    const lines: string[] = [
      "🛡️ *SECURELINK — DIAGNOSTIC ANTI-FRAUDE*",
      "━━━━━━━━━━━━━━━━━━━━",
      `${icon} *VERDICT : ${label} (${score}/100)*`,
      "",
    ];

    if (level === "Critical" || level === "High") {
      lines.push("⚠️ *Ce message présente de fortes caractéristiques d'escroquerie.*");
    } else if (level === "Medium") {
      lines.push("⚠️ *Certains éléments suspects méritent une grande vigilance.*");
    } else {
      lines.push("✅ *Aucune menace hostile connue n'a été détectée dans ce message.*");
    }

    if (signals.length > 0) {
      lines.push("");
      lines.push("🔍 *Éléments détectés :*");
      for (const s of signals.slice(0, 3)) {
        lines.push(`• ${s.evidence || s.value}`);
      }
    }

    if (actions.length > 0) {
      lines.push("");
      lines.push("🚨 *VOS RÉFLEXES IMMÉDIATS :*");
      for (const act of actions.slice(0, 3)) {
        lines.push(`👉 ${act}`);
      }
    }

    if (level === "Critical" || level === "High") {
      lines.push("");
      lines.push("📱 *Rappels Opérateurs (Cameroun) :*");
      lines.push("• MTN MoMo : Changez votre PIN via *126# ou appelez le 8787.");
      lines.push("• Orange Money : Changez votre PIN via *150# ou appelez le 950.");
      lines.push("• *Ne renvoyez JAMAIS d'argent manuellement.*");
    }

    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("🔒 _Vos données ont été anonymisées. Pour vérifier un autre message, transférez-le ici._");

    await sendWhatsApp(fromNumber, lines.join("\n"));

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Erreur générale Webhook WhatsApp:", error);
    return NextResponse.json({ status: "ok" });
  }
}

async function sendWhatsApp(to: string, messageText: string) {
  const token = WHATSAPP_TOKEN;
  const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID manquant.");
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: messageText },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Erreur envoi message Meta WhatsApp:", res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception envoi WhatsApp:", err);
    return false;
  }
}
