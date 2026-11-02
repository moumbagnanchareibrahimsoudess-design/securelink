import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, computeSubjectFingerprint } from "@/lib/db/supabase-admin";
import { supabase } from "@/lib/db/supabase";

// Limitation anti-spam : max 5 soumissions par 10 minutes par IP
const feedbackRateMap = new Map<string, { count: number; resetTime: number }>();

function isFeedbackRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = feedbackRateMap.get(ip);

  if (!entry || now > entry.resetTime) {
    feedbackRateMap.set(ip, { count: 1, resetTime: now + 600000 });
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
  const userAgent = request.headers.get("user-agent") || "unknown";

  if (isFeedbackRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Limite de retours atteinte. Veuillez patienter avant de renvoyer un vote." },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }

  try {
    const body = await request.json();
    const { analysis_id, rating, comment } = body;

    if (!rating || (rating !== "helpful" && rating !== "unhelpful")) {
      return NextResponse.json(
        { error: "Le paramètre rating doit être 'helpful' ou 'unhelpful'." },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;
    if (client) {
      const ipFingerprint = computeSubjectFingerprint(clientIp, userAgent);

      const { error } = await client.from("feedback").insert({
        analysis_id: typeof analysis_id === "number" ? analysis_id : null,
        rating,
        comment: typeof comment === "string" ? comment.trim().slice(0, 500) : null,
        ip_fingerprint: ipFingerprint,
      });

      if (error) {
        console.warn("Notice insertion feedback:", error.message);
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
