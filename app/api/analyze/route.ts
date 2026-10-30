import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/lib/scanner";

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
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de l'analyse :", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'analyse." },
      { status: 500 }
    );
  }
}