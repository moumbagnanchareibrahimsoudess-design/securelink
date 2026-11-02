import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/lib/db/supabase-admin";
import { supabase } from "@/lib/db/supabase";

/**
 * Comparaison cryptographique en temps constant de deux chaînes (D-05).
 * Évite les exceptions sur les longueurs divergentes et immunise contre les timing attacks.
 */
function isTimingSafeMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const bufProvided = Buffer.from(provided, "utf-8");
  const bufExpected = Buffer.from(expected, "utf-8");

  if (bufProvided.length !== bufExpected.length) {
    // Égalisation artificielle pour préserver un coût de calcul constant
    crypto.timingSafeEqual(bufExpected, bufExpected);
    return false;
  }
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Applique le masquage k-anonymat sur les cellules statistiques faibles (< 3 observations)
 * et applique une suppression secondaire pour empêcher la déduction par soustraction (D-03).
 */
function applyKAnonymityCellSuppression(
  counts: Record<string, number>,
  minThreshold = 3
): Record<string, number | string> {
  const result: Record<string, number | string> = {};
  const suppressedKeys: string[] = [];

  for (const [key, val] of Object.entries(counts)) {
    if (val > 0 && val < minThreshold) {
      result[key] = `< ${minThreshold}`;
      suppressedKeys.push(key);
    } else {
      result[key] = val;
    }
  }

  // Suppression secondaire : si exactement 1 seule catégorie est masquée,
  // la valeur exacte pourrait être déduite par soustraction (Total - somme des autres).
  // On masque donc la deuxième plus petite catégorie non nulle.
  if (suppressedKeys.length === 1) {
    const candidates = Object.entries(counts)
      .filter(([k, v]) => !suppressedKeys.includes(k) && v >= minThreshold)
      .sort((a, b) => a[1] - b[1]);

    if (candidates.length > 0) {
      const secondaryKey = candidates[0][0];
      result[secondaryKey] = `< ${minThreshold}*`;
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const authHeader = request.headers.get("authorization");

  const client = supabaseAdmin || supabase;
  if (!client) {
    return NextResponse.json(
      { error: "Base de données non configurée" },
      { status: 503 }
    );
  }

  // ========================================================
  // 1. GESTION DES EXPORTS ADMINISTRATIFS (JSONL / CSV)
  // Source exclusive : private_ml.learning_samples (status = 'approved')
  // Protection stricte : Header 'Authorization: Bearer <ADMIN_API_KEY>' en temps constant (D-01 / D-05)
  // ========================================================
  if (format === "jsonl" || format === "csv") {
    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
      return NextResponse.json(
        { error: "Exports désactivés : ADMIN_API_KEY non configurée sur le serveur." },
        { status: 503 }
      );
    }

    const expectedHeader = `Bearer ${adminKey}`;
    if (!isTimingSafeMatch(authHeader, expectedHeader)) {
      return NextResponse.json(
        { error: "Accès non autorisé. Un jeton d'administration valide est requis dans l'en-tête Authorization." },
        { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
      );
    }

    try {
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Accès refusé : le client d'administration private_ml n'est pas initialisé (SUPABASE_SERVICE_ROLE_KEY manquante)." },
          { status: 503 }
        );
      }

      // RÈGLE FORMELLE D-01 : Requête EXCLUSIVE sur private_ml.learning_samples avec status = 'approved'
      // Règle de non-remplacement : En cas d'erreur, ne JAMAIS se rabattre sur public.analyses
      const { data: samples, error: errSamples } = await supabaseAdmin
        .schema("private_ml" as unknown as "public")
        .from("learning_samples")
        .select("id, source, cleaned_text, sanitized_url, target_risk_level, target_risk_score, attack_category, technical_signals, relations, created_at, status")
        .eq("status", "approved")
        .order("id", { ascending: false })
        .limit(5000);

      if (errSamples) {
        console.error("Erreur interrogation private_ml.learning_samples:", errSamples);
        return NextResponse.json(
          { error: "Corpus d'apprentissage inaccessible : le schéma private_ml est non disponible." },
          { status: 503 }
        );
      }

      const items = samples || [];

      if (format === "jsonl") {
        const jsonlLines = items.map((item) =>
          JSON.stringify({
            id: item.id,
            text: item.cleaned_text,
            url: item.sanitized_url,
            label:
              item.target_risk_level === "Critical" || item.target_risk_level === "High"
                ? "malicious"
                : "benign",
            risk_level: item.target_risk_level,
            risk_score: item.target_risk_score,
            attack_category: item.attack_category || "unspecified",
            signals: Array.isArray(item.technical_signals)
              ? item.technical_signals.map((s: { type?: string }) => s.type || "unknown")
              : [],
            relations: item.relations,
            created_at: item.created_at,
          })
        );

        return new NextResponse(jsonlLines.join("\n"), {
          status: 200,
          headers: {
            "Content-Type": "application/x-ndjson",
            "Content-Disposition": 'attachment; filename="securelink_learning_dataset.jsonl"',
          },
        });
      }

      if (format === "csv") {
        const header = "id,created_at,source,target_risk_level,target_risk_score,attack_category,sanitized_url,cleaned_text\n";
        const rows = items
          .map((i) =>
            [
              i.id,
              `"${i.created_at}"`,
              `"${i.source}"`,
              `"${i.target_risk_level}"`,
              i.target_risk_score,
              `"${(i.attack_category || "").replace(/"/g, '""')}"`,
              `"${(i.sanitized_url || "").replace(/"/g, '""')}"`,
              `"${(i.cleaned_text || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
            ].join(",")
          )
          .join("\n");

        return new NextResponse(header + rows, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="securelink_learning_dataset.csv"',
          },
        });
      }
    } catch (err) {
      console.error("Erreur export private_ml:", err);
      return NextResponse.json(
        { error: "Impossible de générer l'export du corpus privé d'apprentissage." },
        { status: 500 }
      );
    }
  }

  // ========================================================
  // 2. STATISTIQUES PUBLIQUES AGRÉGÉES (ZÉRO DONNÉE PERSONNELLE & ZÉRO ANALYSE INDIVIDUELLE)
  // K-Anonymat par cellule < 3 et suppression secondaire (D-03)
  // Retrait total des analyses individuelles (D-04)
  // Cache HTTP contre les attaques par requêtes différentielles successives
  // ========================================================
  try {
    let summaryData: Record<string, unknown> | null = null;

    // Tentative d'appel via service_role si initialisé
    if (supabaseAdmin) {
      const { data: rpcStats, error: rpcError } = await supabaseAdmin.rpc("get_public_stats");
      if (!rpcError && rpcStats?.summary) {
        summaryData = rpcStats.summary;
      }
    }

    if (!summaryData) {
      const { data: analyses } = await client
        .from("analyses")
        .select("source, risk_score, risk_level")
        .limit(1000);

      const items = analyses || [];
      const total = items.length;

      // Seuil minimal global k-anonymat
      if (total < 5) {
        return NextResponse.json({
          summary: {
            totalAnalyses: total,
            status: "threshold_pending",
            message: "Volume en cours de consolidation (seuil minimal d'affichage : 5).",
          },
        });
      }

      const rawByRisk = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      const rawBySource = { web: 0, whatsapp: 0, other: 0 };

      for (const item of items) {
        const level = (item.risk_level || "Low") as keyof typeof rawByRisk;
        if (rawByRisk[level] !== undefined) rawByRisk[level]++;

        const src = (item.source || "").toLowerCase();
        if (src === "web") rawBySource.web++;
        else if (src.includes("whatsapp")) rawBySource.whatsapp++;
        else rawBySource.other++;
      }

      let feedbackStats = { helpful: 0, unhelpful: 0, totalFeedback: 0, satisfactionRate: null as number | null };
      try {
        const { data: feedbacks } = await client.from("feedback").select("rating");
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
            totalFeedback: totalFb,
            satisfactionRate: totalFb > 0 ? Math.round((helpful / totalFb) * 100) : null,
          };
        }
      } catch {
        // Table feedback non encore disponible
      }

      const highOrCrit = rawByRisk.Critical + rawByRisk.High;

      summaryData = {
        totalAnalyses: total,
        byRisk: applyKAnonymityCellSuppression(rawByRisk, 3),
        bySource: applyKAnonymityCellSuppression(rawBySource, 3),
        highOrCriticalRate: highOrCrit >= 3 ? Math.round((highOrCrit / total) * 100) : "< 3%",
        criticalRate: highOrCrit >= 3 ? Math.round((highOrCrit / total) * 100) : "< 3%",
        feedback: feedbackStats,
      };
    } else {
      // Si la RPC a retourné les statistiques, on s'assure que le masquage D-03 est appliqué
      const sumObj = summaryData as { byRisk?: Record<string, number>; bySource?: Record<string, number> };
      if (sumObj.byRisk && typeof sumObj.byRisk === "object") {
        sumObj.byRisk = applyKAnonymityCellSuppression(sumObj.byRisk, 3) as Record<string, number>;
      }
      if (sumObj.bySource && typeof sumObj.bySource === "object") {
        sumObj.bySource = applyKAnonymityCellSuppression(sumObj.bySource, 3) as Record<string, number>;
      }
    }

    // REMARQUE IMPORTANTE : Conformément à la directive formelle, AUCUNE analyse individuelle n'est renvoyée.
    // L'observatoire public n'expose que des indicateurs macro-agrégés avec un en-tête de cache anti-détection temporelle.
    return NextResponse.json(
      {
        summary: summaryData,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Erreur stats API:", error);
    return NextResponse.json(
      { error: "Impossible de calculer les statistiques publiques." },
      { status: 500 }
    );
  }
}