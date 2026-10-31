import { createClient } from "@supabase/supabase-js";
import { maskSensitiveData } from "./anonymizer";
import { AnalysisResult } from "@/lib/scanner/types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://kjalkseyhamlxdpxywgg.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqYWxrc2V5aGFtbHhkcHh5d2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjgwODUsImV4cCI6MjEwODkwNDA4NX0.zqfx9nngj6DYZcEOGi9cH7WFRlmHtEcyyMArt9se4Io";

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function logAnalysisSafe(
  content: string,
  result: AnalysisResult,
  source: "web" | "whatsapp" = "web",
  consentForTraining: boolean = true
): Promise<number | null> {
  if (!supabase) {
    return null;
  }

  try {
    const safeContent = maskSensitiveData(content);

    const { data, error } = await supabase
      .from("analyses")
      .insert({
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
      })
      .select("id")
      .single();

    if (error) {
      console.warn("Supabase logAnalysis warning:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.warn("Supabase logAnalysis exception:", err);
    return null;
  }
}
