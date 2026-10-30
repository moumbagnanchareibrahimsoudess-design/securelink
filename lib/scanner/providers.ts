import { Signal } from "./types";
import { createSignal } from "./signalEngine";

async function checkUrlhaus(url: string): Promise<Signal | null> {
  const apiKey = process.env.URLHAUS_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const formData = new URLSearchParams();
    formData.append("url", url);

    const res = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      headers: {
        "Auth-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (data?.query_status !== "ok") return null;

    const threat = data.threat || "malware_download";
    const urlStatus = data.url_status || "unknown";

    return createSignal(
      "malware_url_match",
      "known_malware_url",
      "urlhaus",
      `URL associée à la distribution de malware (statut : ${urlStatus}, menace : ${threat}).`,
      0.95,
      "external_reputation"
    );
  } catch {
    return null;
  }
}

async function checkVirusTotal(url: string): Promise<Signal | null> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const urlId = Buffer.from(url).toString("base64").replace(/=/g, "");
    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { "x-apikey": apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;
    const maliciousCount = (stats?.malicious || 0) + (stats?.suspicious || 0);

    if (maliciousCount > 0) {
      return createSignal(
        "external_threat_detection",
        `virustotal_${maliciousCount}`,
        "virustotal",
        `L'URL a été signalée comme suspecte ou malveillante par ${maliciousCount} moteur(s) antivirus.`,
        Math.min(0.5 + maliciousCount * 0.1, 0.99),
        "external_reputation"
      );
    }
  } catch {
    return null;
  }
  return null;
}

export async function getExternalSignals(url: string | null): Promise<Signal[]> {
  if (!url) return [];

  const checks = [checkUrlhaus(url), checkVirusTotal(url)];
  const results = await Promise.allSettled(checks);

  const signals: Signal[] = [];
  for (const res of results) {
    if (res.status === "fulfilled" && res.value !== null) {
      signals.push(res.value);
    }
  }

  return signals;
}
