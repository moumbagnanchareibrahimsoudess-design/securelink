import { NextRequest, NextResponse } from "next/server";
import { recordConsentServerSide } from "@/lib/db/supabase-admin";

export async function GET() {
  return NextResponse.json({
    active_policy_version: "v2026.11",
    consent_version: "c2026.11.1",
    purpose: "threat_intelligence_training_v1",
    description: "Contribution volontaire à l'amélioration de SecureLink",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const choice = body?.choice;
    const policyVersion = body?.policy_version || "v2026.11";
    const clientTimestamp = body?.client_timestamp;

    if (choice !== "accepted" && choice !== "declined") {
      return NextResponse.json(
        { error: "Le paramètre choice doit être 'accepted' ou 'declined'." },
        { status: 400 }
      );
    }

    // Récupération de l'IP masquée et du User-Agent
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await recordConsentServerSide(
      choice,
      policyVersion,
      clientIp,
      userAgent,
      clientTimestamp
    );

    return NextResponse.json({
      success: result.success,
      consent_proof_id: result.consentProofId,
      choice,
      policy_version: policyVersion,
      recorded_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur API Consentement:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le consentement pour le moment." },
      { status: 500 }
    );
  }
}
