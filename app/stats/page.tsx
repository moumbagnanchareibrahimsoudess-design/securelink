"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StatsData {
  summary: {
    totalAnalyses: number;
    byRisk: {
      Critical: number;
      High: number;
      Medium: number;
      Low: number;
    };
    bySource: {
      web: number;
      whatsapp: number;
    };
    criticalRate: number;
    feedback: {
      helpful: number;
      unhelpful: number;
      satisfactionRate: number;
    };
  };
  recent: Array<{
    id: number;
    source: string;
    content: string;
    url: string | null;
    risk_score: number;
    risk_level: string;
    signals: Array<{ type: string; evidence?: string }>;
    created_at: string;
  }>;
}

const RISK_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Critical: { bg: "#FEF2F2", text: "#991B1B", bar: "#EF4444" },
  High: { bg: "#FFF7ED", text: "#9A3412", bar: "#F97316" },
  Medium: { bg: "#FEFCE8", text: "#854D0E", bar: "#EAB308" },
  Low: { bg: "#F0FDF4", text: "#166534", bar: "#22C55E" },
};

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Erreur de chargement des statistiques");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0F4C5C", letterSpacing: -0.5 }}>
              SecureLink
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: "#E0F2FE",
                color: "#0369A1",
                padding: "2px 8px",
                borderRadius: 9999,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Télémétrie en Direct
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={loadStats}
              disabled={loading}
              style={{
                backgroundColor: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
                cursor: loading ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🔄 {loading ? "Actualisation…" : "Actualiser"}
            </button>
            <Link
              href="/analyse"
              style={{
                backgroundColor: "#0F4C5C",
                color: "#FFFFFF",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Scanner un message
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Titre & sous-titre */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            Observatoire des Menaces & Télémétrie
          </h1>
          <p style={{ color: "#64748B", fontSize: 15, margin: 0 }}>
            Suivi en temps réel des analyses anti-fraude, répartition des risques Mobile Money et flux de qualification de données pour l'Afrique francophone.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "14px 18px",
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Grille des KPIs clés */}
        {data && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginBottom: 28,
              }}
            >
              {/* Carte 1 : Total Scans */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>
                    Total des Analyses
                  </span>
                  <span style={{ fontSize: 20 }}>📊</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                  {data.summary.totalAnalyses}
                </div>
                <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
                  ● Persistance PostgreSQL Supabase active
                </div>
              </div>

              {/* Carte 2 : Arnaques Déjouées */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>
                    Menaces Critiques / Élevées
                  </span>
                  <span style={{ fontSize: 20 }}>🚨</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>
                  {data.summary.byRisk.Critical + data.summary.byRisk.High}
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Représente <strong>{data.summary.criticalRate}%</strong> des messages scannés
                </div>
              </div>

              {/* Carte 3 : Satisfaction / Feedback */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>
                    Taux de Satisfaction
                  </span>
                  <span style={{ fontSize: 20 }}>👍</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#0F4C5C", marginBottom: 4 }}>
                  {data.summary.feedback.satisfactionRate}%
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {data.summary.feedback.helpful} votes utiles sur la plateforme
                </div>
              </div>

              {/* Carte 4 : Canaux */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>
                    Canaux d'Entrée
                  </span>
                  <span style={{ fontSize: 20 }}>🌐</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "baseline", marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>
                      {data.summary.bySource.web}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748B", marginLeft: 4 }}>Web</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#059669" }}>
                      {data.summary.bySource.whatsapp}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748B", marginLeft: 4 }}>WhatsApp</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Assistant WhatsApp Bot +237 6 56 73 13 63
                </div>
              </div>
            </div>

            {/* Section Répartition & Export Dataset */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20,
                marginBottom: 28,
              }}
            >
              {/* Distribution des Risques */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "22px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>
                  Répartition par Niveau de Risque
                </h3>

                {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
                  const count = data.summary.byRisk[level];
                  const total = data.summary.totalAnalyses || 1;
                  const pct = Math.round((count / total) * 100);
                  const style = RISK_COLORS[level];

                  const labels: Record<string, string> = {
                    Critical: "🔴 Critique",
                    High: "🟠 Élevé",
                    Medium: "🟡 Modéré",
                    Low: "🟢 Faible",
                  };

                  return (
                    <div key={level} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 600 }}>{labels[level]}</span>
                        <span style={{ color: "#64748B" }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          backgroundColor: "#F1F5F9",
                          borderRadius: 9999,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: style.bar,
                            borderRadius: 9999,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Boîte d'Exportation Dataset IA */}
              <div
                style={{
                  backgroundColor: "#0F4C5C",
                  color: "#FFFFFF",
                  borderRadius: 12,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 12px rgba(15, 76, 92, 0.15)",
                }}
              >
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                    🤖 Pipeline Machine Learning
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>
                    Export du Dataset Souverain
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9, marginBottom: 20 }}>
                    Exportez toutes les analyses réelles anonymisées collectées par SecureLink pour entraîner ou affiner votre modèle de détection d'escroqueries locales (ONNX / DistilBERT).
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="/api/stats?format=jsonl"
                    download="securelink_dataset.jsonl"
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      color: "#0F4C5C",
                      textAlign: "center",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    📦 Exporter en JSONL (IA)
                  </a>
                  <a
                    href="/api/stats?format=csv"
                    download="securelink_telemetry.csv"
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      textAlign: "center",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    📄 Exporter en CSV
                  </a>
                </div>
              </div>
            </div>

            {/* Tableau des Dernières Menaces Détectées */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  padding: "18px 22px",
                  borderBottom: "1px solid #E2E8F0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                    Dernières Détections Anonymisées
                  </h3>
                  <span style={{ fontSize: 12, color: "#64748B" }}>
                    Flux filtré RGPD : aucun numéro de téléphone ni coordonnée bancaire n'est affiché.
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>
                  ● Temps Réel
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>ID</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Canal</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Niveau</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Score</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Contenu Détecté (Anonymisé)</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Signaux Clés</th>
                      <th style={{ padding: "12px 18px", fontWeight: 600 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((item) => {
                      const badgeStyle = RISK_COLORS[item.risk_level] || RISK_COLORS.Low;
                      const dateStr = new Date(item.created_at).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #F1F5F9",
                            transition: "background-color 0.1s",
                          }}
                        >
                          <td style={{ padding: "12px 18px", color: "#94A3B8", fontWeight: 600 }}>
                            #{item.id}
                          </td>
                          <td style={{ padding: "12px 18px", textTransform: "capitalize", fontWeight: 600, color: item.source.includes("whatsapp") ? "#059669" : "#334155" }}>
                            {item.source}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <span
                              style={{
                                backgroundColor: badgeStyle.bg,
                                color: badgeStyle.text,
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontWeight: 700,
                                fontSize: 11,
                              }}
                            >
                              {item.risk_level}
                            </span>
                          </td>
                          <td style={{ padding: "12px 18px", fontWeight: 700 }}>
                            {item.risk_score}
                          </td>
                          <td style={{ padding: "12px 18px", maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.content}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {(item.signals || []).slice(0, 2).map((s, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    backgroundColor: "#F1F5F9",
                                    color: "#475569",
                                    fontSize: 11,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                  }}
                                >
                                  {s.type}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: "12px 18px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
