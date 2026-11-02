// ========================================================
// SECURELINK — MODULE D'ADMINISTRATION & DE SÉCURITÉ SERVEUR
// Strictement réservé aux routes d'API serveur Node.js / Vercel
// AUCUN IMPORT CÔTÉ NAVIGATEUR AUTORISÉ
// ========================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { SanitizationResult } from "./anonymizer";
import { AnalysisResult } from "@/lib/scanner/types";

if (typeof window !== "undefined") {
  throw new Error("Violation de sécurité : ce module serveur ne peut être importé côté client.");
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

// En priorité la clé de rôle de service (qui bypass le RLS pour l'administration interne),
// sinon fallback sur la clé anon si la clé de service n'est pas encore renseignée.
const supabaseAdminKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseAdminKey
    ? createClient(supabaseUrl, supabaseAdminKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

/**
 * Calcule l'empreinte non réversible d'un sujet (IP anonymisée + UserAgent + sel serveur).
 * Ne stocke JAMAIS l'adresse IP brute.
 */
export function computeSubjectFingerprint(clientIp: string, userAgent: string): string {
  const pepper = process.env.SECURELINK_PEPPER || "securelink_salt_2026_default_pepper";
  // Masquage de l'IP : on ne garde que le sous-réseau (ex: 192.168.1.0 ou premier bloc IPv6)
  const ipSubnet = clientIp.includes(":")
    ? clientIp.split(":").slice(0, 3).join(":") // IPv6 /48
    : clientIp.split(".").slice(0, 3).join(".") + ".0"; // IPv4 /24

  return crypto
    .createHmac("sha256", pepper)
    .update(`${ipSubnet}|${userAgent}`)
    .digest("hex");
}

/**
 * Vérifie formellement côté serveur si un identifiant de preuve de consentement est valide et actif.
 */
export async function verifyConsentProof(proofId: string | null | undefined): Promise<boolean> {
  if (!proofId || typeof proofId !== "string" || !supabaseAdmin) {
    return false;
  }

  // Validation UUID basique
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(proofId)) {
    return false;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("consent_records")
      .select("id, choice, status, policy_version")
      .eq("id", proofId)
      .eq("status", "active")
      .eq("choice", "accepted")
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Notice: Impossible de vérifier le consentement serveur:", err);
    return false;
  }
}

/**
 * Enregistre un choix de consentement explicite côté serveur.
 */
export async function recordConsentServerSide(
  choice: "accepted" | "declined",
  policyVersion: string,
  clientIp: string,
  userAgent: string,
  clientTimestamp?: string
): Promise<{ success: boolean; consentProofId: string | null }> {
  if (!supabaseAdmin) {
    return { success: false, consentProofId: null };
  }

  const fingerprint = computeSubjectFingerprint(clientIp, userAgent);

  try {
    const { data, error } = await supabaseAdmin
      .from("consent_records")
      .insert({
        subject_fingerprint: fingerprint,
        choice,
        policy_version: policyVersion || "v2026.11",
        consent_version: "c2026.11.1",
        purpose: "threat_intelligence_training_v1",
        client_timestamp: clientTimestamp || new Date().toISOString(),
        server_timestamp: new Date().toISOString(),
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      console.warn("Notice enregistrement consentement:", error.message);
      return { success: false, consentProofId: null };
    }

    return { success: true, consentProofId: data?.id ?? null };
  } catch (err) {
    console.error("Exception enregistrement consentement:", err);
    return { success: false, consentProofId: null };
  }
}

/**
 * Révocation d'un échantillon d'apprentissage par son jeton de retrait (256 bits).
 * Réponse neutre garantie contre l'énumération.
 */
export async function revokeConsentByToken(
  rawToken: string
): Promise<{ status: "processed"; message: string }> {
  const neutralResponse = {
    status: "processed" as const,
    message: "Si ce jeton correspond à un échantillon actif, celui-ci a été définitivement supprimé du corpus d'apprentissage.",
  };

  if (!rawToken || typeof rawToken !== "string" || !supabaseAdmin) {
    return neutralResponse;
  }

  // Calcul du hash SHA-256 du jeton
  const tokenHash = crypto.createHash("sha256").update(rawToken.trim()).digest("hex");

  try {
    // 1. Suppression dans le schéma privé learning_samples
    const { error: errDel } = await supabaseAdmin
      .schema("private_ml" as unknown as "public")
      .from("learning_samples")
      .delete()
      .eq("withdrawal_token_hash", tokenHash);

    if (errDel) {
      // Si le schéma private_ml n'est pas encore migré, tentative de repli sans bloquer
      await supabaseAdmin
        .from("learning_samples")
        .delete()
        .eq("withdrawal_token_hash", tokenHash);
    }

    // 2. Consignation dans le registre d'audit légal (sans token ni PII)
    try {
      await supabaseAdmin
        .schema("private_ml" as unknown as "public")
        .from("revocation_audit_log")
        .insert({
          revocation_timestamp: new Date().toISOString(),
          status: "purged_from_active_corpus",
        });
    } catch {
      // Non-bloquant si la table d'audit n'est pas encore migrée
    }

    return neutralResponse;
  } catch {
    return neutralResponse;
  }
}

/**
 * Insère un échantillon dé-identifié dans le corpus d'apprentissage privé.
 */
export async function insertLearningSample(
  tokenHash: string,
  consentProofId: string,
  source: "web" | "whatsapp",
  sanitized: SanitizationResult,
  result: AnalysisResult,
  policyVersion: string = "v2026.11"
): Promise<boolean> {
  if (!supabaseAdmin) return false;

  try {
    const status = sanitized.isQuarantined ? "quarantined" : "approved";

    // Détermination de la catégorie technique d'attaque
    const attackCategory =
      result.risk.level === "Critical" || result.risk.level === "High"
        ? (result.signals[0]?.category || "phishing_threat")
        : "benign_content";

    const payload = {
      withdrawal_token_hash: tokenHash,
      consent_proof_id: consentProofId,
      source,
      cleaned_text: sanitized.cleanedText,
      sanitized_url: sanitized.sanitizedUrl,
      target_risk_level: result.risk.level,
      target_risk_score: result.risk.score,
      attack_category: attackCategory,
      technical_signals: result.signals.map((s) => ({ type: s.type, category: s.category })),
      relations: result.relations.map((r) => r.relation),
      status,
      policy_version: policyVersion,
      consent_timestamp: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .schema("private_ml" as unknown as "public")
      .from("learning_samples")
      .insert(payload);

    if (error) {
      // Repli si le schéma private_ml n'est pas encore actif
      const { error: errFallback } = await supabaseAdmin
        .from("learning_samples")
        .insert(payload);
      if (errFallback) {
        console.warn("Notice: learning_samples non encore migrée en base:", errFallback.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.warn("Notice insertLearningSample:", err);
    return false;
  }
}
