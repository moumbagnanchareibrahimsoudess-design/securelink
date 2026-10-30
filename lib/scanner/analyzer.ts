import { AnalysisResult, Signal, Relation } from "./types";
import { analyzeMessage } from "./messageEngine";
import { analyzeUrl } from "./urlEngine";
import { findCombinations } from "./relationEngine";
import { calculateRiskScore } from "./riskEngine";
import { explainRisk } from "./explanationEngine";
import {
  getRecommendedAction,
  getRecommendedActions,
} from "./recommendedAction";
import { getExternalSignals } from "./providers";

export function cleanExtractedUrl(rawUrl: string): string {
  if (!rawUrl) return "";

  let url = rawUrl.trim();
  const trailingPunctuation = ".,;:!?'\"`";

  while (url.length > 0) {
    const lastChar = url[url.length - 1];
    if (trailingPunctuation.includes(lastChar)) {
      url = url.slice(0, -1);
      continue;
    }

    if (
      lastChar === ")" &&
      (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length
    ) {
      url = url.slice(0, -1);
      continue;
    }

    if (
      lastChar === "]" &&
      (url.match(/\[/g) || []).length < (url.match(/\]/g) || []).length
    ) {
      url = url.slice(0, -1);
      continue;
    }

    if (
      lastChar === "}" &&
      (url.match(/\{/g) || []).length < (url.match(/\}/g) || []).length
    ) {
      url = url.slice(0, -1);
      continue;
    }

    break;
  }

  return url;
}

export function extractUrl(content: string): string | null {
  if (!content) return null;
  const match = content.match(/https?:\/\/[^\s<>"'`]+/i);
  if (match) {
    const cleaned = cleanExtractedUrl(match[0]);
    return cleaned.length > 0 ? cleaned : null;
  }
  return null;
}

export async function analyzeContent(content: string): Promise<AnalysisResult> {
  const messageResult = analyzeMessage(content);
  const signals: Signal[] = [...messageResult.signals];

  const url = extractUrl(content);
  if (url) {
    const urlResult = analyzeUrl(url);
    signals.push(...urlResult.signals);

    const externalSignals = await getExternalSignals(url);
    signals.push(...externalSignals);
  }

  const allRelations = findCombinations(signals);
  const meaningfulRelations: Relation[] = allRelations.filter(
    (r) => r.relation !== "unknown_relation"
  );

  const risk = calculateRiskScore(signals, allRelations);

  const explanation = explainRisk(signals, meaningfulRelations, risk);
  const recommended_action = getRecommendedAction(
    risk,
    signals,
    meaningfulRelations
  );
  const recommended_actions = getRecommendedActions(
    risk,
    signals,
    meaningfulRelations
  );

  return {
    version: "1.0",
    message: content,
    url,
    signals,
    relations: meaningfulRelations,
    risk,
    explanation,
    recommended_action,
    recommended_actions,
  };
}
