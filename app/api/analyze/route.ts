import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/scanner";
import { logAnalysisSafe } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = body?.content;
    const consentProofId = typeof body?.consent_proof_id === "string" ? body.consent_proof_id : null;
    const requestedConsent = Boolean(body?.consent);

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu à analyser est requis." },
        { status: 400 }
      );
    }

    const result = await analyzeContent(content);

    // Enregistrement asynchrone sécurisé dans Supabase
    // Règle : si pas de preuve serveur valide, logAnalysisSafe applique false par défaut
    let analysisId: number | null = null;
    let withdrawalToken: string | undefined = undefined;

    try {
      const logRes = await logAnalysisSafe(
        content,
        result,
        "web",
        requestedConsent,
        consentProofId
      );
      analysisId = logRes.analysisId;
      withdrawalToken = logRes.withdrawalToken;
    } catch {
      // Non-bloquant si la DB a une micro-coupure
    }

    return NextResponse.json({
      ...result,
      analysis_id: analysisId,
      ...(withdrawalToken ? { withdrawal_token: withdrawalToken } : {}),
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse :", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'analyse." },
      { status: 500 }
    );
  }
}
