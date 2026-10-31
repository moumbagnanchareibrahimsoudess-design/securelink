import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (!supabase) {
    return NextResponse.json(
      { error: "Base de données non configurée" },
      { status: 503 }
    );
  }

  try {
    // 1. Récupérer toutes les analyses (jusqu'à 1000 pour les stats/export)
    const { data: analyses, error: errAnalyses } = await supabase
      .from("analyses")
      .select("id, source, content, url, risk_score, risk_level, signals, relations, created_at")
      .order("id", { ascending: false })
      .limit(1000);

    if (errAnalyses) {
      throw errAnalyses;
    }

    const items = analyses || [];

    // Export dataset JSONL pour entraînement IA
    if (format === "jsonl") {
      const jsonlLines = items.map((item) =>
        JSON.stringify({
          id: item.id,
          text: item.content,
          url: item.url,
          label: item.risk_level === "Critical" || item.risk_level === "High" ? "malicious" : "benign",
          risk_level: item.risk_level,
          risk_score: item.risk_score,
          signals: (item.signals || []).map((s: any) => s.type),
          created_at: item.created_at,
        })
      );

      return new NextResponse(jsonlLines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson",
          "Content-Disposition": 'attachment; filename="securelink_dataset.jsonl"',
        },
      });
    }

    // Export CSV
    if (format === "csv") {
      const header = "id,created_at,source,risk_level,risk_score,url,content\n";
      const rows = items
        .map((i) =>
          [
            i.id,
            `"${i.created_at}"`,
            `"${i.source}"`,
            `"${i.risk_level}"`,
            i.risk_score,
            `"${(i.url || "").replace(/"/g, '""')}"`,
            `"${(i.content || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          ].join(",")
        )
        .join("\n");

      return new NextResponse(header + rows, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="securelink_telemetry.csv"',
        },
      });
    }

    // Calcul des métriques statistiques agrégées
    const total = items.length;
    const byRisk = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const bySource = { web: 0, whatsapp: 0 };

    for (const item of items) {
      const level = (item.risk_level || "Low") as keyof typeof byRisk;
      if (byRisk[level] !== undefined) byRisk[level]++;

      const src = (item.source || "web").toLowerCase().includes("whatsapp")
        ? "whatsapp"
        : "web";
      bySource[src]++;
    }

    // Récupérer le feedback si la table existe
    let feedbackStats = { helpful: 0, unhelpful: 0, satisfactionRate: 100 };
    try {
      const { data: feedbacks } = await supabase
        .from("feedback")
        .select("rating");
      if (feedbacks && feedbacks.length > 0) {
        let helpful = 0;
        let unhelpful = 0;
        for (const f of feedbacks) {
          if (f.rating === "helpful") helpful++;
          else if (f.rating === "unhelpful") unhelpful++;
        }
        const totalFb = helpful + unhelpful;
        feedbackStats = {
          helpful,
          unhelpful,
          satisfactionRate: totalFb > 0 ? Math.round((helpful / totalFb) * 100) : 100,
        };
      }
    } catch {
      // Table feedback non requise
    }

    return NextResponse.json({
      summary: {
        totalAnalyses: total,
        byRisk,
        bySource,
        criticalRate: total > 0 ? Math.round(((byRisk.Critical + byRisk.High) / total) * 100) : 0,
        feedback: feedbackStats,
      },
      recent: items.slice(0, 15),
    });
  } catch (error: any) {
    console.error("Erreur stats API:", error);
    return NextResponse.json(
      { error: "Impossible de calculer les statistiques : " + (error?.message || error) },
      { status: 500 }
    );
  }
}
