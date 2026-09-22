"use client";

import { useState, useRef, useEffect } from "react";

type Signal = {
  type: string;
  value: string;
  source: string;
  evidence: string;
  confidence: number;
  category: string;
};

type AnalyzeResult = {
  version: string;
  message: string;
  url: string | null;
  signals: Signal[];
  relations: { relation: string }[];
  risk: { score: number; level: string };
  explanation: string[];
  recommended_action: string;
  recommended_actions: string[];
};

type Exchange = {
  id: number;
  content: string;
  loading: boolean;
  result: AnalyzeResult | null;
  error: string | null;
};

const RISK_COLORS: Record<string, string> = {
  Low: "#16803C",
  Medium: "#B7791F",
  High: "#D97706",
  Critical: "#C62828",
};

const RISK_LABELS: Record<string, string> = {
  Low: "RISQUE FAIBLE",
  Medium: "RISQUE MODÉRÉ",
  High: "RISQUE ÉLEVÉ",
  Critical: "RISQUE CRITIQUE",
};

const RISK_ICONS: Record<string, string> = {
  Low: "🟢",
  Medium: "🟠",
  High: "🟠",
  Critical: "🔴",
};

const RISK_VERDICT: Record<string, string> = {
  Low: "Aucun élément préoccupant n'a été détecté dans ce contenu.",
  Medium: "Certains éléments de ce contenu méritent votre vigilance.",
  High: "Plusieurs éléments de ce contenu présentent un risque élevé.",
  Critical: "Plusieurs éléments de ce contenu présentent un risque critique.",
};

const SIGNAL_LABELS: Record<string, string> = {
  urgency: "Pression",
  money: "Élément financier",
  sensitive_data: "Demande sensible",
  unusual_port: "Anomalie technique",
  ip_domain: "Anomalie technique",
  lookalike_domain: "Domaine trompeur",
  external_threat_detection: "Menace confirmée",
  malware_url_match: "Menace confirmée",
};

const RELATION_MESSAGES: Record<string, string> = {
  pressure_for_money: "Pression + Élément financier → Combinaison préoccupante",
  pressure_for_credential: "Pression + Demande de code → Combinaison préoccupante",
  money_for_credential: "Élément financier + Demande sensible → Combinaison préoccupante",
  pressure_for_fake_site: "Pression + Site suspect → Combinaison préoccupante",
  credential_harvesting: "Demande sensible + Domaine trompeur → Schéma de vol d'identifiants",
  financial_fake_site: "Élément financier + Site suspect → Combinaison préoccupante",
  pressure_confirmed_threat: "Pression + Menace confirmée → Combinaison préoccupante",
  credential_confirmed_threat: "Demande sensible + Menace confirmée → Combinaison préoccupante",
  financial_confirmed_threat: "Élément financier + Menace confirmée → Combinaison préoccupante",
};

const PROVIDER_LABELS: Record<string, string> = {
  virustotal: "une source de réputation en ligne (VirusTotal)",
  urlhaus: "une base de données de logiciels malveillants (URLhaus)",
  phishtank: "une base de données de phishing (PhishTank)",
  google_web_risk: "une liste de ressources dangereuses (Google Web Risk)",
};

const EXTERNAL_CATEGORY = "external_reputation";

export default function Home() {
  const [content, setContent] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges]);

  const hasStarted = exchanges.length > 0;
  const isAnyLoading = exchanges.some((e) => e.loading);

  async function handleAnalyze() {
    const submitted = content.trim();
    if (!submitted || isAnyLoading) return;

    const id = Date.now();
    setContent("");
    setExchanges((prev) => [
      ...prev,
      { id, content: submitted, loading: true, result: null, error: null },
    ]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: submitted }),
      });

      if (!response.ok) throw new Error("L'analyse a échoué.");

      const data: AnalyzeResult = await response.json();
      setExchanges((prev) =>
        prev.map((e) => (e.id === id ? { ...e, loading: false, result: data } : e))
      );
    } catch {
      setExchanges((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, loading: false, error: "Une erreur est survenue. Réessayez." }
            : e
        )
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F7F9FC",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        @keyframes securelink-spin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder { color: #98a2b3; }
      `}</style>

      <header
        style={{
          padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)",
          borderBottom: "1px solid #E4E7EC",
        }}
      >
        <span style={{ fontWeight: 600, color: "#0F4C5C", fontSize: "clamp(15px, 4vw, 16px)" }}>
          SecureLink
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: hasStarted ? "flex-start" : "center",
          alignItems: "center",
          padding: "clamp(16px, 5vw, 24px)",
          overflowY: "auto",
          gap: 16,
        }}
      >
        {!hasStarted && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <h1 style={{ fontSize: "clamp(19px, 5vw, 22px)", fontWeight: 600, marginBottom: 8 }}>
              Vérifiez avant de faire confiance.
            </h1>
            <p style={{ color: "#667085", fontSize: "clamp(14px, 3.5vw, 15px)" }}>
              Un message, un lien ou un document vous semble douteux ? Analysez-le avant d&apos;agir.
            </p>
          </div>
        )}

        {exchanges.map((exchange) => {
          const isInconclusive =
            exchange.result !== null &&
            exchange.result.risk.level === "Low" &&
            exchange.result.signals.length === 0 &&
            exchange.result.url !== null;

          const riskColor = exchange.result
            ? isInconclusive
              ? "#667085"
              : RISK_COLORS[exchange.result.risk.level] ?? "#667085"
            : "#667085";
          const riskLabel = exchange.result
            ? isInconclusive
              ? "VÉRIFICATION INSUFFISANTE"
              : RISK_LABELS[exchange.result.risk.level] ?? "VÉRIFICATION INSUFFISANTE"
            : "";

          return (
            <div
              key={exchange.id}
              style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#0F4C5C",
                  color: "#FFFFFF",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 14,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {exchange.content}
              </div>

              {exchange.loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#667085", fontSize: 14 }}>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #E4E7EC",
                      borderTopColor: "#0F4C5C",
                      borderRadius: "50%",
                      animation: "securelink-spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Analyse en cours…
                </div>
              )}

              {exchange.error && (
                <div style={{ color: "#C62828", fontSize: 14 }}>{exchange.error}</div>
              )}

              {exchange.result && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    borderRadius: 8,
                    padding: "clamp(16px, 5vw, 24px)",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>
                      {isInconclusive ? "⚪" : RISK_ICONS[exchange.result.risk.level] ?? "⚪"}
                    </span>
                    <span style={{ color: riskColor, fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
                      {riskLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: 15, marginBottom: 16, lineHeight: 1.5 }}>
                    {isInconclusive
                      ? "Certains éléments méritent votre attention, mais les informations disponibles ne permettent pas de confirmer un risque."
                      : RISK_VERDICT[exchange.result.risk.level] ?? "Vérification insuffisante pour ce contenu."}
                  </p>

                  <p style={{ fontSize: 12, color: "#98A2B3", marginBottom: 16 }}>
                    Score technique : {exchange.result.risk.score} / 100
                  </p>

                  {exchange.result.signals.filter((s) => s.category !== EXTERNAL_CATEGORY).length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, color: "#667085" }}>
                        POURQUOI ?
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {exchange.result.signals
                          .filter((s) => s.category !== EXTERNAL_CATEGORY)
                          .map((s, i) => (
                            <div key={i} style={{ display: "flex", gap: 10 }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#0F4C5C",
                                  minWidth: 20,
                                }}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>
                                  {SIGNAL_LABELS[s.type] ?? s.type}
                                </div>
                                <div style={{ fontSize: 13, color: "#667085" }}>
                                  « {s.value} »
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {exchange.result.url && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, color: "#667085" }}>
                        PREUVES
                      </h3>
                      {exchange.result.signals.filter((s) => s.category === EXTERNAL_CATEGORY).length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {exchange.result.signals
                            .filter((s) => s.category === EXTERNAL_CATEGORY)
                            .map((s, i) => (
                              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                                <span style={{ color: "#C62828" }}>⚠</span>
                                <span>
                                  Signalé par {PROVIDER_LABELS[s.source] ?? s.source}.
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13, color: "#98A2B3", fontStyle: "italic" }}>
                          Aucune preuve externe exploitable n&apos;a été obtenue pour ce lien.
                        </p>
                      )}
                    </div>
                  )}

                  {exchange.result.relations.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, color: "#667085" }}>
                        COMMENT CES ÉLÉMENTS SONT LIÉS ?
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Array.from(
                          new Set(
                            exchange.result.relations.map(
                              (r) => RELATION_MESSAGES[r.relation] ?? null
                            )
                          )
                        )
                          .filter(Boolean)
                          .map((msg, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 13,
                                color: "#111827",
                                backgroundColor: "#F7F9FC",
                                borderRadius: 6,
                                padding: "8px 12px",
                              }}
                            >
                              {msg}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid #E4E7EC", paddingTop: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, marginBottom: 12, color: "#667085" }}>
                      CE QUE VOUS DEVRIEZ FAIRE
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {exchange.result.recommended_actions.map((action, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, fontWeight: 500 }}>
                          <span style={{ color: "#0F4C5C" }}>•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </main>

      {/* Zone de saisie — en bas, bouton intégré dans le textarea */}
      <div style={{ borderTop: "1px solid #E4E7EC", backgroundColor: "#FFFFFF", padding: "clamp(8px, 2vw, 12px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ position: "relative" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Collez votre message, lien ou contenu ici…"
              rows={2}
              style={{
                resize: "none",
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                padding: "10px 100px 36px 12px",
                fontSize: 16,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                display: "block",
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnyLoading || !content.trim()}
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                backgroundColor: "#0F4C5C",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                minHeight: 32,
                fontSize: 13,
                fontWeight: 500,
                cursor: isAnyLoading ? "default" : "pointer",
                opacity: isAnyLoading || !content.trim() ? 0.6 : 1,
              }}
            >
              Analyser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}