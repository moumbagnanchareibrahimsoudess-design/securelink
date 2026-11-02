import { NextRequest, NextResponse } from "next/server";
import { revokeConsentByToken } from "@/lib/db/supabase-admin";

// Limitation basique par IP (fenêtre glissante en mémoire : 5 requêtes par minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }

  if (entry.count >= 5) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Trop de tentatives de retrait. Veuillez réessayer dans 1 minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!token || token.length < 16 || token.length > 128) {
      // Réponse neutre même si le format est invalide pour éviter l'énumération par oracle d'erreur
      return NextResponse.json(
        {
          status: "processed",
          message:
            "Si ce jeton correspond à un échantillon actif, celui-ci a été définitivement supprimé du corpus d'apprentissage.",
        },
        { status: 200 }
      );
    }

    const result = await revokeConsentByToken(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erreur API Retrait:", error);
    return NextResponse.json(
      {
        status: "processed",
        message:
          "Si ce jeton correspond à un échantillon actif, celui-ci a été définitivement supprimé du corpus d'apprentissage.",
      },
      { status: 200 }
    );
  }
}
