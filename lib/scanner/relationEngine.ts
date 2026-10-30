import { Signal, Relation } from "./types";

export const relationRules: Record<string, string> = {
  "financial,pressure": "pressure_for_money",
  "credential,pressure": "pressure_for_credential",
  "credential,financial": "money_for_credential",
  "pressure,technical_anomaly": "pressure_for_fake_site",
  "credential,technical_anomaly": "credential_harvesting",
  "financial,technical_anomaly": "financial_fake_site",
  "external_reputation,pressure": "pressure_confirmed_threat",
  "credential,external_reputation": "credential_confirmed_threat",
  "external_reputation,financial": "financial_confirmed_threat",
};

export const relationStrength: Record<string, number> = {
  pressure_for_money: 0.7,
  pressure_for_credential: 0.7,
  money_for_credential: 0.8,
  pressure_for_fake_site: 0.8,
  credential_harvesting: 0.9,
  financial_fake_site: 0.8,
  pressure_confirmed_threat: 0.9,
  credential_confirmed_threat: 0.95,
  financial_confirmed_threat: 0.9,
};

function getPairKey(catA?: string, catB?: string): string {
  if (!catA || !catB) return "";
  return [catA, catB].sort().join(",");
}

export function identifyRelation(categoryA?: string, categoryB?: string): string {
  const key = getPairKey(categoryA, categoryB);
  return relationRules[key] || "unknown_relation";
}

export function findCombinations(signals: Signal[]): Relation[] {
  const relations: Relation[] = [];
  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const a = signals[i];
      const b = signals[j];
      relations.push({
        signal_a: a.type,
        category_a: a.category,
        confidence_a: a.confidence,
        signal_b: b.type,
        category_b: b.category,
        confidence_b: b.confidence,
        relation: identifyRelation(a.category, b.category),
      });
    }
  }
  return relations;
}
