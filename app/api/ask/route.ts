import { NextRequest, NextResponse } from "next/server";
import { answerQuestion } from "@/lib/scanner";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = body?.question;
    const context = body?.context || {};

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "La question est requise." },
        { status: 400 }
      );
    }

    const response = await answerQuestion(question, context);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'appel du conseiller :", error);
    return NextResponse.json(
      { error: "Le conseiller n'a pas pu traiter votre demande pour le moment." },
      { status: 500 }
    );
  }
}
