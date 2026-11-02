"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface StatsData {
  summary: {
    totalAnalyses: number;
    status?: string;
    message?: string;
    byRisk: Record<string, number | string>;
    bySource: Record<string, number | string>;
    highOrCriticalRate?: number | string;
    criticalRate: number | string;
    feedback: {
      helpful: number;
      unhelpful: number;
      totalFeedback: number;
      satisfactionRate: number | null;
    };
  };
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

  // Gestion de l'exportation administrative sécurisée (Bearer token)
  const [adminToken, setAdminToken] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleManualRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Erreur de chargement des statistiques");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible de charger les données";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de chargement des statistiques");
        return res.json();
      })
      .then((json: StatsData) => {
        if (active) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg = err instanceof Error ? err.message : "Impossible de charger les données";
          setError(msg);
          setLoading(false);
        }
      });

    const interval = setInterval(() => {
      fetch("/api/stats")
        .then((res) => (res.ok ? res.json() : null))
        .then((json: StatsData | null) => {
          if (active && json) setData(json);
        })
        .catch(() => {});
    }, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  async function handleAdminDownload(format: "jsonl" | "csv") {
    if (!adminToken.trim()) {
      setExportError("Veuillez saisir votre clé d'administration (ADMIN_API_KEY).");
      return;
    }

    setExportLoading(true);
    setExportError(null);

    try {
      const res = await fetch(`/api/stats?format=${format}`, {
        headers: {
          Authorization: `Bearer ${adminToken.trim()}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Clé d'administration invalide ou non autorisée (401).");
        }
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Erreur lors de l'exportation (${res.status}).`);
      }

      const blob = await res.blob();
      const filename =
        format === "jsonl" ? "securelink_learning_dataset.jsonl" : "securelink_learning_dataset.csv";
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowExportModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors du téléchargement";
      setExportError(msg);
    } finally {
      setExportLoading(false);
    }
  }

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
              Observatoire Public
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleManualRefresh}
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
            Suivi macro-agrégé des analyses anti-fraude, répartition des risques Mobile Money et indicateurs souverains pour l&apos;Afrique francophone.
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

        {/* Message de seuil k-anonymat si volume restreint */}
        {data?.summary?.status === "threshold_pending" && (
          <div
            style={{
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1E40AF",
              padding: "16px 20px",
              borderRadius: 10,
              marginBottom: 24,
              fontSize: 14,
            }}
          >
            ℹ️ {data.summary.message}
          </div>
        )}

        {/* Grille des KPIs clés */}
        {data && data.summary.byRisk && (
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
                  {typeof data.summary.highOrCriticalRate === "number"
                    ? `${data.summary.highOrCriticalRate}%`
                    : data.summary.highOrCriticalRate || `${data.summary.criticalRate}%`}
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  Part des menaces qualifiées dans les flux observés
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
                  {data.summary.feedback.satisfactionRate !== null
                    ? `${data.summary.feedback.satisfactionRate}%`
                    : "—"}
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  {data.summary.feedback.satisfactionRate !== null
                    ? `${data.summary.feedback.helpful} votes utiles sur la plateforme`
                    : "En attente de votes des utilisateurs"}
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
                    Canaux d&apos;Entrée
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
              {/* Distribution des Risques avec K-Anonymat (D-03) */}
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
                  const rawCount = data.summary.byRisk[level];
                  const total = data.summary.totalAnalyses || 1;
                  const isString = typeof rawCount === "string";
                  const countNum = typeof rawCount === "number" ? rawCount : 0;
                  const pct = isString ? "< 3%" : `${Math.round((countNum / total) * 100)}%`;
                  const barWidth = isString ? "4%" : `${Math.round((countNum / total) * 100)}%`;
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
                          {rawCount ?? 0} {isString ? "" : `(${pct})`}
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
                            width: barWidth,
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

              {/* Boîte d'Exportation Dataset IA Privé */}
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
                    🤖 Pipeline Machine Learning Souverain
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>
                    Export du Dataset d&apos;Apprentissage
                  </h3>
                  <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9, marginBottom: 14 }}>
                    Source exclusive : schéma privé <code style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "2px 4px", borderRadius: 4 }}>private_ml.learning_samples</code>. Uniquement les échantillons approuvés et qualifiés par le pipeline de dé-identification.
                  </p>
                  <div style={{ fontSize: 12, backgroundColor: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
                    🔒 <strong>Accès Restreint :</strong> Jeton Bearer obligatoire (comparaison sécurisée en temps constant). Les requêtes non autorisées sont rejetées (HTTP 401).
                  </div>
                </div>

                {!showExportModal ? (
                  <button
                    onClick={() => setShowExportModal(true)}
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#0F4C5C",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    🔐 Déverrouiller l&apos;Export Chercheur (ADMIN_API_KEY)
                  </button>
                ) : (
                  <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: 14, borderRadius: 8 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                      Clé d&apos;autorisation Bearer :
                    </label>
                    <input
                      type="password"
                      placeholder="Collez votre ADMIN_API_KEY..."
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.3)",
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        fontSize: 13,
                        marginBottom: 10,
                        boxSizing: "border-box",
                      }}
                    />

                    {exportError && (
                      <div style={{ color: "#FCA5A5", fontSize: 12, marginBottom: 10 }}>
                        ⚠️ {exportError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleAdminDownload("jsonl")}
                        disabled={exportLoading}
                        style={{
                          flex: 1,
                          backgroundColor: "#FFFFFF",
                          color: "#0F4C5C",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: exportLoading ? "wait" : "pointer",
                        }}
                      >
                        {exportLoading ? "Téléchargement…" : "📦 Export JSONL"}
                      </button>
                      <button
                        onClick={() => handleAdminDownload("csv")}
                        disabled={exportLoading}
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "#FFFFFF",
                          border: "1px solid rgba(255,255,255,0.4)",
                          borderRadius: 6,
                          padding: "8px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: exportLoading ? "wait" : "pointer",
                        }}
                      >
                        📄 Export CSV
                      </button>
                      <button
                        onClick={() => {
                          setShowExportModal(false);
                          setExportError(null);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          color: "rgba(255,255,255,0.7)",
                          border: "none",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: "0 6px",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Synthèse Macro des Vecteurs d'Attaque Observés (ZÉRO ANALYSE INDIVIDUELLE) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                    Typologies des Menaces Émergentes (Afrique Francophone)
                  </h3>
                  <span style={{ fontSize: 13, color: "#64748B" }}>
                    Cartographie globale consolidée — protection intégrale contre toute ré-identification individuelle.
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, backgroundColor: "#ECFDF5", padding: "4px 10px", borderRadius: 9999 }}>
                  ● Indicateurs Souverains
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>
                    📱 Faux Dépôts & Annulations Mobile Money
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    SMS imitant MTN MoMo ou Orange Money demandant d&apos;annuler une transaction erronée ou de renvoyer des fonds sur un lien frauduleux.
                  </div>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>
                    🔑 Vol d&apos;Identifiants & Codes Secrets (OTP / PIN)
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    Pages miroirs exploitant l&apos;urgence psychologique pour dérober le code secret *126# ou *150# et vider le portefeuille électronique.
                  </div>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>
                    💼 Escroqueries aux Concours & Emplois Publics
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    Usurpation de ministères ou douanes exigeant des frais de visite médicale ou de dossier payables exclusivement par Mobile Money.
                  </div>
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                    🌐 Domaines Trompeurs (Typosquattage)
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    Adresses Web contrefaites avec extensions inhabituelles ou adresses IP brutes détectées et neutralisées par nos moteurs heuristiques.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}