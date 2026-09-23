import re

# Expressions régulières pour la détection des données sensibles personnelles
EMAIL_REGEX = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
)

# Numéros de téléphones camerounais (9 chiffres: 6XXXXXXXX / 2XXXXXXXX ou avec indicatif +237)
# et formats internationaux / français
PHONE_CAMEROON_REGEX = re.compile(
    r"(?:\+?237[\s.-]?)?(?:6|2)\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b"
)
PHONE_GENERIC_REGEX = re.compile(
    r"(?:\+?\d{1,3}[\s.-]?)?(?:(?:\(0\))|0)?[1-9](?:[\s.-]?\d{2}){4}\b"
)

# Numéros de cartes bancaires (16 chiffres, groupés par 4 ou continus)
CREDIT_CARD_REGEX = re.compile(
    r"\b(?:\d{4}[\s-]?){3}\d{4}\b"
)

# Format IBAN
IBAN_REGEX = re.compile(
    r"\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b"
)


def mask_sensitive_data(text: str) -> str:
    """
    Masque les données à caractère personnel (téléphones camerounais et internationaux,
    emails, numéros de carte bancaire, IBAN) avant enregistrement en base de données.
    """
    if not text:
        return text

    masked = text

    # 1. Masquage des coordonnées bancaires
    masked = CREDIT_CARD_REGEX.sub("[CARTE BANCAIRE MASQUÉE]", masked)
    masked = IBAN_REGEX.sub("[IBAN MASQUÉ]", masked)

    # 2. Masquage des emails
    masked = EMAIL_REGEX.sub("[EMAIL MASQUÉ]", masked)

    # 3. Masquage des numéros de téléphone (Cameroun et international)
    masked = PHONE_CAMEROON_REGEX.sub("[TÉLÉPHONE MASQUÉ]", masked)
    masked = PHONE_GENERIC_REGEX.sub("[TÉLÉPHONE MASQUÉ]", masked)

    return masked
