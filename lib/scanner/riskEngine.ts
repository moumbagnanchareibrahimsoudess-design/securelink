import { Signal, Relation, Risk } from "./types";
import { relationStrength } from "./relationEngine";

export const signalWeights: Record<string, number> = {
  urgency: 10,
  money: 15,
  sensitive_data: 25,
  ip_domain: 10,
  unusual_port: 5,
  lookalike_domain: 20,
  external_threat_detection: 30,
  malware_url_match: 35,
  phishing_database_match: 35,
  malformed_url: 15,
};

export const RELATION_MULTIPLIER = 20;

export const RISK_THRESHOLDS: [number, "Low" | "Medium" | "High"][] = [
  [30, "Low"],
  [70, "Medium"],
  [80, "High"],
];
export const DEFAULT_LEVEL: Risk["level"] = "Critical";

export function getRiskLevel(score: number): Risk["level"] {
  for (const [threshold, level] of RISK_THRESHOLDS) {
    if (score < threshold) {
      return level;
    }
  }
  return DEFAULT_LEVEL;
}

export function calculateRiskScore(
  signals: Signal[],
  relations: Relation[] = []
): Risk {
  let score = 0;

  for (const signal of signals) {
    const weight = signalWeights[signal.type] || 0;
    score += weight * signal.confidence;
  }

  for (const relation of relations) {
    if (relation.relation !== "unknown_relation") {
      const strength = relationStrength[relation.relation] || 0;
      score += strength * RELATION_MULTIPLIER;
    }
  }

  score = Math.min(score, 100);

  return {
    score: Math.round(score * 10) / 10,
    level: getRiskLevel(score),
  };
}
