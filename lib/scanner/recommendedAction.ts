import { Risk, Signal, Relation } from "./types";

export const recommendedActionsMap: Record<string, string> = {
  Low: "Aucune menace importante détectée. Restez attentif.",
  Medium: "Vérifiez les éléments suspects avant d'agir.",
  High: "Évitez toute action avant vérification approfondie.",
  Critical: "Ne cliquez sur aucun lien et ne transmettez aucune information sensible.",
};

export function getRecommendedAction(
  risk: Risk,
  _signals?: Signal[],
  _relations?: Relation[]
): string {
  return (
    recommendedActionsMap[risk.level] ||
    "Niveau de risque inconnu — vérifiez manuellement."
  );
}

export function getRecommendedActions(
  risk: Risk,
  signals: Signal[],
  _relations?: Relation[]
): string[] {
  const actions: string[] = [];
  const level = risk.level;

  if (level === "Low") {
    actions.push("Aucune action nécessaire pour le moment.");
    actions.push("Restez attentif à toute demande inhabituelle.");
  } else if (level === "Medium") {
    actions.push("Vérifiez les éléments suspects avant d'agir.");
    actions.push("Ne transmettez aucune information sensible sans confirmation.");
  } else if (level === "High") {
    actions.push("Évitez toute action avant vérification approfondie.");
    actions.push("Ne cliquez sur aucun lien tant que la source n'est pas confirmée.");
  } else {
    // Critical
    actions.push("Ne cliquez sur aucun lien.");
    actions.push("Ne transmettez aucune information sensible.");
  }

  const signalTypes = new Set(signals.map((s) => s.type));

  if (signalTypes.has("sensitive_data")) {
    actions.push("Ne transmettez jamais votre code ou mot de passe par ce biais.");
  }

  if (
    signalTypes.has("lookalike_domain") ||
    signalTypes.has("external_threat_detection") ||
    signalTypes.has("malware_url_match")
  ) {
    actions.push("Vérifiez l'adresse du site officiel directement, sans passer par ce lien.");
  }

  if (signalTypes.has("money")) {
    actions.push("Ne procédez à aucun paiement tant que l'expéditeur n'est pas vérifié.");
  }

  const seen = new Set<string>();
  const uniqueActions: string[] = [];
  for (const action of actions) {
    if (!seen.has(action)) {
      seen.add(action);
      uniqueActions.push(action);
    }
  }

  return uniqueActions;
}
