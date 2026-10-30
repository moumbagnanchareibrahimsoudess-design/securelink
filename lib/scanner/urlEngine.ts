import { Signal } from "./types";
import { createSignal } from "./signalEngine";
import { domainKnowledge } from "./knowledge";

export function detectIpDomain(domain: string | null): boolean {
  if (!domain) return false;

  // IPv4 check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = domain.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1, 5).map(Number);
    return octets.every((octet) => octet >= 0 && octet <= 255);
  }

  // IPv6 check
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv6Regex.test(domain) || domain.includes("::")) {
    return true;
  }

  return false;
}

export function detectUnusualPort(urlString: string): number | null {
  try {
    const parsed = new URL(urlString);
    if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
      const portNum = parseInt(parsed.port, 10);
      return isNaN(portNum) ? null : portNum;
    }
  } catch {
    return null;
  }
  return null;
}

export function similarityScore(domainA: string | null, domainB: string | null): number {
  if (!domainA || !domainB) return 0.0;
  const a = domainA.toLowerCase();
  const b = domainB.toLowerCase();
  if (a === b) return 1.0;

  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;

  const minLen = Math.min(a.length, b.length);
  let charDifferences = 0;
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) {
      charDifferences++;
    }
  }
  const differences = charDifferences + Math.abs(a.length - b.length);
  return Math.max(0.0, 1 - differences / maxLength);
}

export function detectLookalikeDomain(domain: string | null): [string | null, number] {
  if (!domain) return [null, 0.0];
  const knownDomains = domainKnowledge.known_domains;

  let bestDomain: string | null = null;
  let bestScore = 0.0;

  for (const known of knownDomains) {
    const score = similarityScore(domain, known);
    if (score > bestScore) {
      bestScore = score;
      bestDomain = known;
    }
  }

  return [bestDomain, bestScore];
}

export interface UrlAnalysisResult {
  url: string;
  scheme: string;
  domain: string | null;
  path: string;
  query: string;
  is_ip_domain: boolean;
  signals: Signal[];
}

export function analyzeUrl(rawUrl: string): UrlAnalysisResult {
  if (!rawUrl) {
    return {
      url: "",
      scheme: "",
      domain: null,
      path: "",
      query: "",
      is_ip_domain: false,
      signals: [],
    };
  }

  let domain: string | null = null;
  let scheme = "";
  let path = "";
  let query = "";

  try {
    let urlToParse = rawUrl;
    if (!urlToParse.startsWith("http://") && !urlToParse.startsWith("https://")) {
      urlToParse = "http://" + urlToParse;
    }
    const parsed = new URL(urlToParse);
    domain = parsed.hostname || null;
    scheme = parsed.protocol ? parsed.protocol.replace(":", "") : "";
    path = parsed.pathname || "";
    query = parsed.search ? parsed.search.replace("?", "") : "";
  } catch {
    domain = null;
  }

  const signals: Signal[] = [];

  const unusualPort = detectUnusualPort(rawUrl);
  if (unusualPort !== null) {
    signals.push(
      createSignal(
        "unusual_port",
        String(unusualPort),
        "url",
        `l'url utilise un port inhabituel :${unusualPort}.`,
        0.8,
        "technical_anomaly"
      )
    );
  }

  if (!domain) {
    signals.push(
      createSignal(
        "malformed_url",
        rawUrl,
        "url",
        "L'URL est malformée ou ne contient aucun nom d'hôte valide.",
        0.8,
        "technical_anomaly"
      )
    );
    return {
      url: rawUrl,
      scheme,
      domain: null,
      path,
      query,
      is_ip_domain: false,
      signals,
    };
  }

  const isIp = detectIpDomain(domain);
  if (isIp) {
    signals.push(
      createSignal(
        "ip_domain",
        domain,
        "url",
        `L'URL contient un domaine IP : ${domain}.`,
        0.9,
        "technical_anomaly"
      )
    );
  }

  const [lookalikeDomain, similarity] = detectLookalikeDomain(domain);
  if (lookalikeDomain !== null && similarity > 0.8 && domain !== lookalikeDomain) {
    signals.push(
      createSignal(
        "lookalike_domain",
        lookalikeDomain,
        "url",
        `L'URL contient un domaine ressemblant à un domaine connu : ${lookalikeDomain} (${similarity.toFixed(2)}).`,
        similarity,
        "technical_anomaly"
      )
    );
  } else {
    const brandPatterns = domainKnowledge.brand_patterns;
    const lowerDomain = domain.toLowerCase();

    for (const [brand, officialDomains] of Object.entries(brandPatterns)) {
      if (lowerDomain.includes(brand)) {
        const isOfficial = officialDomains.some(
          (od) => lowerDomain === od || lowerDomain.endsWith("." + od)
        );
        if (!isOfficial) {
          signals.push(
            createSignal(
              "lookalike_domain",
              `impersonation_${brand}`,
              "url",
              `L'URL utilise la marque ou le service '${brand.toUpperCase()}' sur un domaine non officiel (${domain}).`,
              0.95,
              "technical_anomaly"
            )
          );
          break;
        }
      }
    }
  }

  return {
    url: rawUrl,
    scheme,
    domain,
    path,
    query,
    is_ip_domain: isIp,
    signals,
  };
}
