"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

type FollowUp = {
  id: number;
  question: string;
  loading: boolean;
  reply: string | null;
  error: string | null;
};

type Exchange = {
  id: number;
  content: string;
  loading: boolean;
  result: AnalyzeResult | null;
  error: string | null;
  followUps?: FollowUp[];
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

const SAMPLE_TESTS = [
  {
    title: "SMS Faux Dépôt MoMo",
    badge: "Arnaque Mobile Money",
    text: "Dépôt de 45 000 FCFA reçu de 690123456. Erreur de transfert, veuillez annuler la transaction et renvoyer les fonds sur https://momo-annuler-transfert.cm",
    icon: "📱",
  },
  {
    title: "Faux Concours / Emploi",
    badge: "Faux Recrutement",
    text: "Félicitations ! Votre dossier a été retenu pour le recrutement spécial à la Douane. Réglez 15 000 FCFA de frais médicaux obligatoires par Orange Money sur https://concours-douane-cm.org",
    icon: "💼",
  },
  {
    title: "Message de confiance",
    badge: "Légitime",
    text: "Bonjour, voici le lien pour notre réunion d'équipe sur Google Meet : https://meet.google.com",
    icon: "🟢",
  },
];

const ADVISOR_SUGGESTIONS = [
  { label: "J'ai déjà cliqué sur le lien, que faire ?", icon: "🚨" },
  { label: "J'ai donné mon code PIN MoMo / Orange Money", icon: "🔐" },
  { label: "J'ai transféré de l'argent par Mobile Money", icon: "💸" },
  { label: "Comment signaler à l'ANTIC ou mon opérateur ?", icon: "🛡️" },
  { label: "Pourquoi ce message est-il suspect ?", icon: "🔍" },
];

function generateUniqueId(): number {
  return Date.now();
}

function renderBold(str: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#0F172A", fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function renderMarkdownAdvice(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} style={{ height: 6 }} />;
    if (trimmed.startsWith("### ")) {
      return (
        <h4
          key={idx}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#0F4C5C",
            marginTop: 8,
            marginBottom: 6,
          }}
        >
          {trimmed.replace("### ", "")}
        </h4>
      );
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const content = trimmed.substring(2);
      return (
        <div
          key={idx}
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "#334155",
            marginBottom: 6,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#0F4C5C", fontWeight: 700 }}>•</span>
          <span>{renderBold(content)}</span>
        </div>
      );
    }
    const matchNumbered = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (matchNumbered) {
      return (
        <div
          key={idx}
          style={{
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "#334155",
            marginBottom: 8,
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 700, color: "#0F4C5C", minWidth: 18 }}>
            {matchNumbered[1]}.
          </span>
          <span>{renderBold(matchNumbered[2])}</span>
        </div>
      );
    }
    return (
      <p
        key={idx}
        style={{
          fontSize: 13,
          color: "#334155",
          marginBottom: 6,
          lineHeight: 1.5,
        }}
      >
        {renderBold(trimmed)}
      </p>
    );
  });
}

export default function AnalysePage() {
  const [content, setContent] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 44), 160);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [content]);

  const hasStarted = exchanges.length > 0;
  const isAnyLoading = exchanges.some(
    (e) => e.loading || e.followUps?.some((f) => f.loading)
  );

  const lastExchange = exchanges.length > 0 ? exchanges[exchanges.length - 1] : null;

  async function handleAnalyze(overrideText?: string) {
    const textToSubmit = (overrideText ?? content).trim();
    if (!textToSubmit || isAnyLoading) return;

    const id = generateUniqueId();
    setContent("");
    setExchanges((prev) => [
      ...prev,
      { id, content: textToSubmit, loading: true, result: null, error: null, followUps: [] },
    ]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textToSubmit }),
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
            ? { ...e, loading: false, error: "Une erreur est survenue lors de l'analyse. Réessayez." }
            : e
        )
      );
    }
  }

  async function handleAskAdvisor(questionText: string, targetExchangeId?: number) {
    const q = questionText.trim();
    if (!q || isAnyLoading) return;

    const targetEx = targetExchangeId
      ? exchanges.find((e) => e.id === targetExchangeId)
      : lastExchange;

    if (!targetEx || !targetEx.result) {
      handleAnalyze(q);
      return;
    }

    const followUpId = generateUniqueId();
    setContent("");

    setExchanges((prev) =>
      prev.map((e) => {
        if (e.id === targetEx.id) {
          const followUps = e.followUps ?? [];
          return {
            ...e,
            followUps: [
              ...followUps,
              { id: followUpId, question: q, loading: true, reply: null, error: null },
            ],
          };
        }
        return e;
      })
    );

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: {
            message: targetEx.content,
            url: targetEx.result.url,
            risk_level: targetEx.result.risk.level,
            risk_score: targetEx.result.risk.score,
            signals: targetEx.result.signals,
            recommended_actions: targetEx.result.recommended_actions,
          },
        }),
      });

      if (!res.ok) throw new Error("Erreur conseiller");
      const data = await res.json();

      setExchanges((prev) =>
        prev.map((e) => {
          if (e.id === targetEx.id) {
            return {
              ...e,
              followUps: (e.followUps ?? []).map((f) =>
                f.id === followUpId ? { ...f, loading: false, reply: data.reply } : f
              ),
            };
          }
          return e;
        })
      );
    } catch {
      setExchanges((prev) =>
        prev.map((e) => {
          if (e.id === targetEx.id) {
            return {
              ...e,
              followUps: (e.followUps ?? []).map((f) =>
                f.id === followUpId
                  ? { ...f, loading: false, error: "Le conseiller n'a pas pu répondre. Réessayez." }
                  : f
              ),
            };
          }
          return e;
        })
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const trimmed = content.trim();
      const hasUrl = /https?:\/\/[^\s]+/i.test(trimmed);
      if (hasStarted && lastExchange?.result && !hasUrl && trimmed.length < 120) {
        handleAskAdvisor(trimmed);
      } else {
        handleAnalyze();
      }
    }
  }

  function handleReset() {
    setExchanges([]);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }

  function handleCopyReport(exchange: Exchange) {
    if (!exchange.result) return;
    const r = exchange.result;
    const label = RISK_LABELS[r.risk.level] ?? r.risk.level;
    const actions =
      r.recommended_actions.length > 0
        ? "\nRecommandations :\n" + r.recommended_actions.map((a) => `• ${a}`).join("\n")
        : "";

    const reportText = `🛡️ Rapport de vérification SecureLink
Verdict : ${label} (Score : ${r.risk.score}/100)
Contenu analysé : "${exchange.content}"
${actions}

Vérifié avec SecureLink.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedId(exchange.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      <style jsx global>{`
        @keyframes securelink-spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }
        textarea::placeholder {
          color: #94a3b8;
        }
        .example-card:hover {
          border-color: #0f4c5c !important;
          background-color: #f0f9ff !important;
          transform: translateY(-2px);
        }
        .suggestion-chip:hover {
          border-color: #0f4c5c !important;
          background-color: #e0f2fe !important;
          color: #0f4c5c !important;
        }
        .btn-hover:hover {
          filter: brightness(0.95);
        }
      `}</style>

      {/* En-tête */}
      <header
        style={{
          padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)",
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 8,
              backgroundColor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              transition: "all 0.15s ease",
            }}
            title="Revenir à la page d'accueil"
          >
            <span>←</span>
            <span>Accueil</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span
              style={{
                fontWeight: 700,
                color: "#0F4C5C",
                fontSize: "clamp(16px, 4vw, 18px)",
                letterSpacing: -0.3,
              }}
            >
              SecureLink
            </span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#ECFDF5",
              color: "#047857",
              padding: "3px 10px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid #A7F3D0",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                display: "inline-block",
                animation: "pulse-dot 2s infinite ease-in-out",
              }}
            />
            Système opérationnel & Conseiller actif
          </div>
        </div>

        {hasStarted && (
          <button
            onClick={handleReset}
            className="btn-hover"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#F1F5F9",
              color: "#334155",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span>↺</span>
            <span>Nouvelle analyse</span>
          </button>
        )}
      </header>

      {/* Zone centrale défilante */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: hasStarted ? "flex-start" : "center",
          alignItems: "center",
          padding: "clamp(16px, 5vw, 24px)",
          overflowY: "auto",
          gap: 20,
        }}
      >
        {/* Écran d'accueil avant le premier échange */}
        {!hasStarted && (
          <div style={{ textAlign: "center", maxWidth: 620, width: "100%", margin: "auto 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                backgroundColor: "#E0F2FE",
                color: "#0F4C5C",
                borderRadius: 16,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                marginBottom: 16,
              }}
            >
              🛡️
            </div>
            <h1
              style={{
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 700,
                marginBottom: 10,
                color: "#0F172A",
                letterSpacing: -0.5,
              }}
            >
              Vérifiez avant de faire confiance.
            </h1>
            <p
              style={{
                color: "#64748B",
                fontSize: "clamp(14px, 3.5vw, 16px)",
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              Un message, un SMS ou un lien vous paraît suspect ? Analysez-le instantanément et
              dialoguez avec notre conseiller en cas de doute.
            </p>

            {/* Cartes d'exemples interactifs */}
            <div style={{ textAlign: "left", marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Exemples rapides à tester en 1 clic :
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {SAMPLE_TESTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(sample.text)}
                  className="example-card"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{sample.icon}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      {sample.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                    {sample.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4,
                    }}
                  >
                    {sample.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historique des échanges */}
        {exchanges.map((exchange) => {
          const isInconclusive =
            exchange.result !== null &&
            exchange.result.risk.level === "Low" &&
            exchange.result.signals.length === 0 &&
            exchange.result.url !== null;

          const riskColor = exchange.result
            ? isInconclusive
              ? "#64748B"
              : RISK_COLORS[exchange.result.risk.level] ?? "#64748B"
            : "#64748B";

          const riskLabel = exchange.result
            ? isInconclusive
              ? "VÉRIFICATION INSUFFISANTE"
              : RISK_LABELS[exchange.result.risk.level] ?? "VÉRIFICATION INSUFFISANTE"
            : "";

          return (
            <div
              key={exchange.id}
              style={{
                width: "100%",
                maxWidth: 640,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Bulle utilisateur - Message soumis */}
              <div
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#0F4C5C",
                  color: "#FFFFFF",
                  borderRadius: 12,
                  padding: "10px 16px",
                  fontSize: 14,
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  boxShadow: "0 1px 2px rgba(15,76,92,0.15)",
                }}
              >
                {exchange.content}
              </div>

              {/* Indicateur de chargement de l'analyse */}
              {exchange.loading && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: "#64748B",
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #E2E8F0",
                      borderTopColor: "#0F4C5C",
                      borderRadius: "50%",
                      animation: "securelink-spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span>Analyse approfondie en cours (moteurs & bases de menaces)…</span>
                </div>
              )}

              {/* Erreur */}
              {exchange.error && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#991B1B",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 14,
                  }}
                >
                  {exchange.error}
                </div>
              )}

              {/* Carte Résultat d'Analyse */}
              {exchange.result && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: "clamp(16px, 5vw, 24px)",
                    boxSizing: "border-box",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Verdict en haut */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>
                        {isInconclusive ? "⚪" : RISK_ICONS[exchange.result.risk.level] ?? "⚪"}
                      </span>
                      <span
                        style={{
                          color: riskColor,
                          fontWeight: 800,
                          fontSize: 16,
                          letterSpacing: 0.5,
                        }}
                      >
                        {riskLabel}
                      </span>
                    </div>

                    {/* Bouton copier rapport */}
                    <button
                      onClick={() => handleCopyReport(exchange)}
                      className="btn-hover"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: copiedId === exchange.id ? "#ECFDF5" : "#F8FAFC",
                        color: copiedId === exchange.id ? "#047857" : "#475569",
                        border: `1px solid ${
                          copiedId === exchange.id ? "#A7F3D0" : "#CBD5E1"
                        }`,
                        borderRadius: 6,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title="Copier un résumé propre pour messagerie ou collègues"
                    >
                      <span>{copiedId === exchange.id ? "✅" : "📋"}</span>
                      <span>
                        {copiedId === exchange.id ? "Copié !" : "Copier le diagnostic"}
                      </span>
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 15,
                      marginBottom: 16,
                      lineHeight: 1.5,
                      color: "#334155",
                    }}
                  >
                    {isInconclusive
                      ? "Certains éléments méritent votre attention, mais les informations disponibles ne permettent pas de confirmer un risque."
                      : RISK_VERDICT[exchange.result.risk.level] ??
                        "Vérification insuffisante pour ce contenu."}
                  </p>

                  {/* Jauge Visuelle de Score */}
                  <div
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
                        SCORE DE RISQUE TECHNIQUE
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: riskColor }}>
                        {exchange.result.risk.score} / 100
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        backgroundColor: "#E2E8F0",
                        borderRadius: 9999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(Math.max(exchange.result.risk.score, 3), 100)}%`,
                          backgroundColor: riskColor,
                          borderRadius: 9999,
                          transition: "width 0.8s ease-out",
                        }}
                      />
                    </div>
                  </div>

                  {/* Section 1: Signaux internes / Pourquoi ? */}
                  {exchange.result.signals.filter((s) => s.category !== EXTERNAL_CATEGORY).length >
                    0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h3
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          marginBottom: 12,
                          color: "#64748B",
                        }}
                      >
                        POURQUOI ?
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {exchange.result.signals
                          .filter((s) => s.category !== EXTERNAL_CATEGORY)
                          .map((s, i) => (
                            <div
                              key={i}
                              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "#0F4C5C",
                                  backgroundColor: "#E0F2FE",
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  minWidth: 20,
                                  textAlign: "center",
                                }}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                                  {SIGNAL_LABELS[s.type] ?? s.type}
                                </div>
                                <div style={{ fontSize: 13, color: "#64748B" }}>
                                  « {s.value} »
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Preuves externes */}
                  {exchange.result.url && (
                    <div style={{ marginBottom: 20 }}>
                      <h3
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          marginBottom: 12,
                          color: "#64748B",
                        }}
                      >
                        PREUVES & BASES EXTERNES
                      </h3>
                      {exchange.result.signals.filter((s) => s.category === EXTERNAL_CATEGORY)
                        .length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {exchange.result.signals
                            .filter((s) => s.category === EXTERNAL_CATEGORY)
                            .map((s, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  fontSize: 13,
                                  backgroundColor: "#FEF2F2",
                                  border: "1px solid #FEE2E2",
                                  padding: "8px 12px",
                                  borderRadius: 6,
                                  color: "#991B1B",
                                }}
                              >
                                <span>⚠</span>
                                <span>Signalé par {PROVIDER_LABELS[s.source] ?? s.source}.</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#94A3B8",
                            fontStyle: "italic",
                            margin: 0,
                          }}
                        >
                          Aucune preuve externe hostile signalée pour ce lien dans les bases
                          consultées.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Section 3: Relations et corrélations */}
                  {exchange.result.relations.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h3
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          marginBottom: 12,
                          color: "#64748B",
                        }}
                      >
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
                                color: "#1E293B",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
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

                  {/* Section 4: Recommandations */}
                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                    <h3
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        marginBottom: 12,
                        color: "#64748B",
                      }}
                    >
                      CE QUE VOUS DEVRIEZ FAIRE
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {exchange.result.recommended_actions.map((action, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 8,
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#1E293B",
                          }}
                        >
                          <span style={{ color: "#0F4C5C", fontWeight: 700 }}>•</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 5: Suggestions interactives du Conseiller */}
                  <div
                    style={{
                      borderTop: "1px dashed #CBD5E1",
                      marginTop: 20,
                      paddingTop: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>🛡️</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#0F4C5C",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        Des questions ? Demandez conseil en 1 clic :
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ADVISOR_SUGGESTIONS.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleAskAdvisor(sug.label, exchange.id)}
                          className="suggestion-chip"
                          style={{
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 20,
                            padding: "6px 12px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#334155",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span>{sug.icon}</span>
                          <span>{sug.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Fils de discussion avec le Conseiller (Follow-ups) */}
              {exchange.followUps &&
                exchange.followUps.map((fu) => (
                  <div
                    key={fu.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 4,
                    }}
                  >
                    {/* Question utilisateur */}
                    <div
                      style={{
                        alignSelf: "flex-end",
                        backgroundColor: "#334155",
                        color: "#FFFFFF",
                        borderRadius: 12,
                        padding: "8px 14px",
                        fontSize: 13,
                        maxWidth: "80%",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      💬 {fu.question}
                    </div>

                    {/* Chargement de la réponse */}
                    {fu.loading && (
                      <div
                        style={{
                          alignSelf: "flex-start",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: 10,
                          padding: "8px 14px",
                          fontSize: 13,
                          color: "#64748B",
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid #E2E8F0",
                            borderTopColor: "#0F4C5C",
                            borderRadius: "50%",
                            animation: "securelink-spin 0.7s linear infinite",
                            display: "inline-block",
                          }}
                        />
                        <span>Le conseiller rédige ses recommandations…</span>
                      </div>
                    )}

                    {/* Erreur */}
                    {fu.error && (
                      <div
                        style={{
                          backgroundColor: "#FEF2F2",
                          color: "#991B1B",
                          fontSize: 13,
                          padding: "8px 12px",
                          borderRadius: 8,
                        }}
                      >
                        {fu.error}
                      </div>
                    )}

                    {/* Réponse du conseiller */}
                    {fu.reply && (
                      <div
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderLeft: "4px solid #0F4C5C",
                          borderRadius: 10,
                          padding: "14px 18px",
                          maxWidth: "92%",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>🛡️</span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0F4C5C",
                              letterSpacing: 0.5,
                            }}
                          >
                            CONSEILLER SECURELINK
                          </span>
                        </div>
                        <div>{renderMarkdownAdvice(fu.reply)}</div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </main>

      {/* Zone de saisie */}
      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "clamp(10px, 2.5vw, 16px)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              position: "relative",
              border: "1px solid #CBD5E1",
              borderRadius: 12,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasStarted
                  ? "Posez une question au conseiller ou collez un nouveau contenu…"
                  : "Collez votre message, SMS, email ou lien suspect ici…"
              }
              rows={1}
              style={{
                resize: "none",
                border: "none",
                padding: "12px 170px 12px 14px",
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                lineHeight: 1.4,
                backgroundColor: "transparent",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 7,
                right: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {content.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setContent("")}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: "4px 8px",
                  }}
                  title="Effacer la saisie"
                >
                  ✕
                </button>
              )}

              {hasStarted && lastExchange?.result && content.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAskAdvisor(content)}
                  disabled={isAnyLoading}
                  className="btn-hover"
                  style={{
                    backgroundColor: "#334155",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 11px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: isAnyLoading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Poser cette question au conseiller"
                >
                  <span>💬</span>
                  <span>Conseil</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={isAnyLoading || !content.trim()}
                className="btn-hover"
                style={{
                  backgroundColor: "#0F4C5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isAnyLoading || !content.trim() ? "not-allowed" : "pointer",
                  opacity: isAnyLoading || !content.trim() ? 0.5 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                {isAnyLoading && (
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid #FFFFFF",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "securelink-spin 0.6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                )}
                <span>Analyser</span>
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 6,
              padding: "0 4px",
              fontSize: 11,
              color: "#94A3B8",
            }}
          >
            <span>
              {hasStarted
                ? "Entrée pour envoyer votre question ou lancer une analyse"
                : "Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne"}
            </span>
            <span>Conseiller & protection active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
