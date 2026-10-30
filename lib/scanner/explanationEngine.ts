import { Signal, Relation, Risk } from "./types";

export const relationExplications: Record<string, string> = {
  pressure_for_money:
    "le message combine une pression urgente avec une demande ou une promesse financiere.",
  pressure_for_credential:
    "le message combine une pression urgente avec une demande d'informations sensibles.",
  money_for_credential:
    "le message associe un element financier a une demande d'information sensible.",
  pressure_for_fake_site:
    "le message combine une pression urgente avec un lien vers un site suspect.",
  credential_harvesting:
    "le message combine une demande d'informations sensibles avec un lien vers un faux site, ce qui est un schema classique de vol d'identifiants.",
  financial_fake_site:
    "le message combine un element financier avec un lien vers un site suspect.",
  pressure_confirmed_threat:
    "le message combine une pression urgente avec une menace confirmee par une source externe.",
  credential_confirmed_threat:
    "le message combine une demande d'informations sensibles avec une menace confirmee par une source externe.",
  financial_confirmed_threat:
    "le message combine un element financier avec une menace confirmee par une source externe.",
};

export const signalExplanations: Record<string, string> = {
  urgency: "le message exerce une pression ou creer un sentiment d'urgence.",
  money: "le message contient un element financier ou une demande liee a l'argent.",
  sensitive_data: "le message ou mentionne des informations sensibles.",
  unusual_port: "le lien utilise un port inhabituel, ce qui merite une verification.",
  lookalike_domain: "le domain du lien ressemble fortement a celui d'un serveur connu.",
  external_threat_detection: "l'url a ete signalee comme malveillante ou suspecte par des sources de securite externes.",
  malware_url_match: "l'url est connue pour distribuer des logiciels malveillants.",
  phishing_database_match: "l'url est répertoriée dans la base PhishTank comme un site de phishing avéré.",
  malformed_url: "l'url fournie présente une syntaxe anormale ou ne contient aucun nom de domaine valide.",
};

export function explainRisk(
  signals: Signal[],
  relations: Relation[],
  risk: Risk
): string[] {
  const explanation: string[] = [];

  for (const signal of signals) {
    const text = signalExplanations[signal.type];
    if (text && !explanation.includes(text)) {
      explanation.push(text);
    }
  }

  for (const relation of relations) {
    const text = relationExplications[relation.relation];
    if (text && !explanation.includes(text)) {
      explanation.push(text);
    }
  }

  explanation.push(`risque global : ${risk.level} (score : ${risk.score})`);

  return explanation;
}
