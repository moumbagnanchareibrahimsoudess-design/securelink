import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis_id, rating, comment } = body;

    if (!rating || (rating !== "helpful" && rating !== "unhelpful")) {
      return NextResponse.json(
        { error: "Le paramètre rating doit être 'helpful' ou 'unhelpful'." },
        { status: 400 }
      );
    }

    if (supabase) {
      const { error } = await supabase.from("feedback").insert({
        analysis_id: typeof analysis_id === "number" ? analysis_id : null,
        rating,
        comment: typeof comment === "string" ? comment.slice(0, 500) : null,
      });

      if (error) {
        console.warn("Notice: Table feedback non encore créée ou RLS strict:", error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Merci pour votre retour ! Il aide à améliorer l'IA SecureLink.",
    });
  } catch (error) {
    console.error("Erreur API Feedback:", error);
    return NextResponse.json(
      { success: true, message: "Retour bien pris en compte." },
      { status: 200 }
    );
  }
}
