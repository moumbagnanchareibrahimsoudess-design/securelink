import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/scanner";
import { logAnalysisSafe } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = body?.content;

    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Le contenu à analyser est requis." },
        { status: 400 }
      );
    }

    const result = await analyzeContent(content);

    // Enregistrement asynchrone sécurisé dans Supabase
    let analysisId: number | null = null;
    try {
      analysisId = await logAnalysisSafe(content, result, "web");
    } catch {
      // Non-bloquant si la DB a une micro-coupure
    }

    return NextResponse.json({
      ...result,
      analysis_id: analysisId,
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse :", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'analyse." },
      { status: 500 }
    );
  }
}