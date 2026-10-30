import { createClient } from "@supabase/supabase-js";
import { maskSensitiveData } from "./anonymizer";
import { AnalysisResult } from "@/lib/scanner/types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function logAnalysisSafe(
  content: string,
  result: AnalysisResult,
  source: "web" | "whatsapp" = "web",
  consentForTraining: boolean = true
): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    const safeContent = maskSensitiveData(content);

    const { error } = await supabase.from("analyses").insert({
      source,
      content: safeContent,
      url: result.url,
      risk_score: result.risk.score,
      risk_level: result.risk.level,
      signals: result.signals,
      relations: result.relations,
      explanation: result.explanation,
      recommended_action: result.recommended_action,
      user_consent_training: consentForTraining,
    });

    if (error) {
      console.warn("Supabase logAnalysis warning:", error.message);
    }
  } catch (err) {
    console.warn("Supabase logAnalysis exception:", err);
  }
}
