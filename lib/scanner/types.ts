export interface Signal {
  type: string;
  value: string;
  source: string;
  evidence: string;
  confidence: number;
  category?: string;
}

export interface Relation {
  signal_a: string;
  category_a?: string;
  confidence_a: number;
  signal_b: string;
  category_b?: string;
  confidence_b: number;
  relation: string;
}

export interface Risk {
  score: number;
  level: "Low" | "Medium" | "High" | "Critical";
}

export interface AnalysisResult {
  version: string;
  message: string;
  url: string | null;
  signals: Signal[];
  relations: Relation[];
  risk: Risk;
  explanation: string[];
  recommended_action: string;
  recommended_actions: string[];
}
