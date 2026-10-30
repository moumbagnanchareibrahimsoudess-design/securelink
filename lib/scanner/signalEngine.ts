import { Signal } from "./types";

export function createSignal(
  type: string,
  value: string,
  source: string,
  evidence: string,
  confidence: number,
  category?: string
): Signal {
  return {
    type,
    value,
    source,
    evidence,
    confidence,
    category,
  };
}
