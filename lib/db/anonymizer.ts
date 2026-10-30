// Regex pour la détection et l'anonymisation des données personnelles (RGPD & lois locales)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Téléphones camerounais (+237 ou 6XXXXXXXX / 2XXXXXXXX) et internationaux
const PHONE_CAMEROON_REGEX = /(?:\+?237[\s.-]?)?(?:6|2)\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/g;
const PHONE_GENERIC_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:(?:\(0\))|0)?[1-9](?:[\s.-]?\d{2}){4}\b/g;

// Cartes bancaires (16 chiffres)
const CREDIT_CARD_REGEX = /\b(?:\d{4}[\s-]?){3}\d{4}\b/g;

// Format IBAN
const IBAN_REGEX = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g;

export function maskSensitiveData(text: string): string {
  if (!text) return text;

  let masked = text;
  masked = masked.replace(CREDIT_CARD_REGEX, "[CARTE BANCAIRE MASQUÉE]");
  masked = masked.replace(IBAN_REGEX, "[IBAN MASQUÉ]");
  masked = masked.replace(EMAIL_REGEX, "[EMAIL MASQUÉ]");
  masked = masked.replace(PHONE_CAMEROON_REGEX, "[TÉLÉPHONE MASQUÉ]");
  masked = masked.replace(PHONE_GENERIC_REGEX, "[TÉLÉPHONE MASQUÉ]");

  return masked;
}
