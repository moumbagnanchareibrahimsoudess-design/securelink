import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { maskSensitiveData, sanitizeForLearning } from "./anonymizer";
import { AnalysisResult } from "@/lib/scanner/types";
import {
  verifyConsentProof,
  insertLearningSample,
  supabaseAdmin,
} from "./supabase-admin";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface LogAnalysisOutput {
  analysisId: number | null;
  withdrawalToken?: string;
}

/**
 * Enregistre une analyse de manière sécurisée.
 * RÈGLE FONDAMENTALE : consentForTraining est STRICTEMENT ÉGAL À FALSE PAR DÉFAUT.
 * Aucun enregistrement d'apprentissage n'est créé sans preuve serveur vérifiable.
 */
export async function logAnalysisSafe(
  content: string,
  result: AnalysisResult,
  source: "web" | "whatsapp" = "web",
  consentForTraining: boolean = false, // STRICT REFUS PAR DÉFAUT
  consentProofId?: string | null
): Promise<LogAnalysisOutput> {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return { analysisId: null };
  }

  // 1. Vérification formelle du consentement côté serveur
  let isConsentVerified = false;
  if (consentForTraining && consentProofId) {
    isConsentVerified = await verifyConsentProof(consentProofId);
  }

  // Si le consentement n'est pas rigoureusement prouvé, forcer à false
  const finalConsent = isConsentVerified;
  let rawWithdrawalToken: string | undefined = undefined;

  try {
    const safeContent = maskSensitiveData(content);

    // 2. Insertion opérationnelle dans public.analyses
    const insertPayload: Record<string, unknown> = {
      source,
      content: safeContent,
      url: result.url,
      risk_score: result.risk.score,
      risk_level: result.risk.level,
      signals: result.signals,
      relations: result.relations,
      explanation: result.explanation,
      recommended_action: result.recommended_action,
      user_consent_training: finalConsent,
    };

    if (finalConsent && consentProofId) {
      insertPayload.consent_proof_id = consentProofId;
    }

    const { data, error } = await client
      .from("analyses")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      console.warn("Notice insertion analyse:", error.message);
    }

    const analysisId = data?.id ?? null;

    // 3. Si le consentement est authentifié, alimenter le corpus d'apprentissage privé
    if (finalConsent && consentProofId) {
      // Génération d'un jeton CSPRNG de 256 bits (32 octets aléatoires)
      rawWithdrawalToken = crypto.randomBytes(32).toString("base64url");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawWithdrawalToken)
        .digest("hex");

      const sanitized = sanitizeForLearning(content, result.url);

      await insertLearningSample(
        tokenHash,
        consentProofId,
        source,
        sanitized,
        result
      );
    }

    return {
      analysisId,
      withdrawalToken: rawWithdrawalToken,
    };
  } catch (err) {
    console.warn("Exception logAnalysisSafe:", err);
    return { analysisId: null };
  }
}
