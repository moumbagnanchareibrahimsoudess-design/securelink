// ========================================================
// SECURELINK — MODULE DE DÉ-IDENTIFICATION & ASSAINISSEMENT
// Conformité stricte RGPD, Convention de Malabo & ANTIC
// ========================================================

// 1. REGEX DE PREMIER NIVEAU (DONNÉES PERSONNELLES CLASSIQUES)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

// Téléphones camerounais (+237 ou 6XXXXXXXX / 2XXXXXXXX avec variantes d'espacement et tirets)
const PHONE_CAMEROON_REGEX = /(?:\+?237[\s.-]?)?(?:6|2)\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/g;

// Téléphones génériques internationaux
const PHONE_GENERIC_REGEX = /(?:\+?\d{1,3}[\s.-]?)?(?:(?:\(0\))|0)?[1-9](?:[\s.-]?\d{2}){4}\b/g;

// Cartes bancaires (16 chiffres consécutifs ou groupés par 4)
const CREDIT_CARD_REGEX = /\b(?:\d{4}[\s-]?){3}\d{4}\b/g;

// Format IBAN international
const IBAN_REGEX = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/gi;

// 2. REGEX FINANCIÈRES & MOBILE MONEY (AFRIQUE / CAMEROUN)
// Références de transfert Mobile Money (MTN MoMo, Orange Money, Express Union)
const MOMO_TXID_REGEX = /\b(?:TxID|Trans ID|ID Trans|Ref|Reference|Transaction ID|TransID|Code)[\s.:#]+[A-Za-z0-9._-]{5,30}\b/gi;
const MOMO_CODE_PREFIX_REGEX = /\b(?:CI|PP|MP|OM|EU)\d{6,14}[A-Za-z0-9]*\b/g;

// Codes OTP / PIN temporaires (4 à 8 chiffres mentionnés avec contexte de code secret)
const OTP_SECRET_REGEX = /\b(?:OTP|PIN|code secret|mot de passe|password|votre code|code de confirmation|code de validation)(?:[^\d\n]{0,35})([0-9]{4,8})\b/gi;

// 3. SALUTATIONS NOMINATIVES DIRECTES
const SALUTATION_NAME_REGEX = /\b(?:Cher|Chère|M\.|Mme|Monsieur|Madame|Dr\.|Me)\s+([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)?)\b/g;

/**
 * Masque les données sensibles directes pour l'archivage opérationnel standard.
 */
export function maskSensitiveData(text: string): string {
  if (!text) return text;

  let masked = text;
  masked = masked.replace(CREDIT_CARD_REGEX, "[CARTE BANCAIRE MASQUÉE]");
  masked = masked.replace(IBAN_REGEX, "[IBAN MASQUÉ]");
  masked = masked.replace(EMAIL_REGEX, "[EMAIL MASQUÉ]");
  masked = masked.replace(PHONE_CAMEROON_REGEX, "[TÉLÉPHONE MASQUÉ]");
  masked = masked.replace(PHONE_GENERIC_REGEX, "[TÉLÉPHONE MASQUÉ]");
  masked = masked.replace(MOMO_TXID_REGEX, "[RÉFÉRENCE TRANSACTION MASQUÉE]");
  masked = masked.replace(MOMO_CODE_PREFIX_REGEX, "[REF_MOMO_MASQUÉE]");
  masked = masked.replace(OTP_SECRET_REGEX, "[CODE CONFIDENTIEL MASQUÉ]");
  masked = masked.replace(SALUTATION_NAME_REGEX, "Cher client [NOM MASQUÉ]");

  return masked;
}

/**
 * Assainit une URL pour éliminer les paramètres de traçage et les identifiants d'utilisateur.
 * Préserve le nom de domaine hôte et le chemin générique.
 */
export function sanitizeUrlForLearning(rawUrl: string | null): string | null {
  if (!rawUrl) return null;

  try {
    let urlString = rawUrl.trim();
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
      urlString = "https://" + urlString;
    }

    const parsed = new URL(urlString);

    // Supprimer tous les paramètres d'URL (query params et fragments de session)
    parsed.search = "";
    parsed.hash = "";

    // Nettoyer les chemins contenant des identifiants numériques directs (ex: /user/12345/...)
    let cleanPath = parsed.pathname.replace(/\/([0-9]{4,})\b/g, "/[ID_MASQUE]");
    cleanPath = cleanPath.replace(/\/([a-f0-9]{24,64})\b/gi, "/[HASH_MASQUE]");

    return `${parsed.protocol}//${parsed.host}${cleanPath}`;
  } catch {
    // Si l'URL est mal formée, ne conserver que le premier segment avant les caractères '?' ou '&'
    return rawUrl.split("?")[0].split("#")[0].slice(0, 150);
  }
}

export interface SanitizationResult {
  cleanedText: string;
  sanitizedUrl: string | null;
  isQuarantined: boolean;
  quarantineReasons: string[];
}

/**
 * Pipeline d'assainissement renforcé pour le corpus d'apprentissage privé.
 * Comprend un audit post-nettoyage et une mise en quarantaine automatique si un risque persiste.
 */
export function sanitizeForLearning(text: string, rawUrl: string | null): SanitizationResult {
  const quarantineReasons: string[] = [];

  // Étape 1 : Nettoyage multi-niveaux du texte
  let cleanedText = maskSensitiveData(text);

  // Étape 2 : Assainissement d'URL
  const sanitizedUrl = sanitizeUrlForLearning(rawUrl);

  // Étape 3 : Audit de dé-identification de second niveau (Contrôle résiduel)
  // Vérification 1 : Détection de séquences résiduelles de 9 chiffres consécutifs ou plus (téléphones omis)
  if (/\b\d{9,16}\b/.test(cleanedText)) {
    quarantineReasons.push("sequence_numerique_longue_detectee");
    cleanedText = cleanedText.replace(/\b\d{9,16}\b/g, "[NUMÉRO RÉSIDUEL MASQUÉ]");
  }

  // Vérification 2 : Détection d'adresses email résiduelles non captées
  if (/@/.test(cleanedText) && !cleanedText.includes("[EMAIL MASQUÉ]")) {
    quarantineReasons.push("arobase_residuel_detecte");
  }

  // Vérification 3 : Détection d'adresses IPv4 privées ou publiques brutes
  if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(cleanedText)) {
    quarantineReasons.push("adresse_ip_detectee");
    cleanedText = cleanedText.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP MASQUÉE]");
  }

  // Vérification 4 : Longueur atypique ou entropie anormale
  if (cleanedText.length > 2500) {
    quarantineReasons.push("longueur_excessive_apprentissage");
  }

  // Vérification 5 : Présence de codes confidentiels ou OTP
  if (
    cleanedText.includes("[CODE CONFIDENTIEL MASQUÉ]") ||
    /\b(?:OTP|PIN|code secret|mot de passe)[\s.:]+[0-9]{4,8}\b/i.test(cleanedText)
  ) {
    quarantineReasons.push("code_confidentiel_ou_otp_detecte");
  }

  const isQuarantined = quarantineReasons.length > 0;

  return {
    cleanedText,
    sanitizedUrl,
    isQuarantined,
    quarantineReasons,
  };
}
