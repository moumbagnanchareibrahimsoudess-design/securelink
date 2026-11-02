"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [choice, setChoice] = useState<"accepted" | "declined" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<{
    choice: string;
    proofId?: string;
    timestamp?: string;
  } | null>(null);

  // État du formulaire de retrait (Droit à l'oubli)
  const [revokeToken, setRevokeToken] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeResult, setRevokeResult] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("securelink_privacy_consent");
      if (stored) {
        const parsed = JSON.parse(stored);
        queueMicrotask(() => {
          setCurrentConsent(parsed);
          if (parsed.choice === "accepted" || parsed.choice === "declined") {
            setChoice(parsed.choice);
          }
        });
      }
    } catch {
      // Ignorer si localStorage est inaccessible
    }
  }, []);

  async function handleSaveConsent() {
    if (!choice) {
      setStatusMessage("Veuillez sélectionner l'une des deux options.");
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          choice,
          policy_version: "v2026.11",
          client_timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      const consentObj = {
        choice,
        proofId: data.consent_proof_id,
        timestamp: data.recorded_at,
        policyVersion: data.policy_version,
      };

      setCurrentConsent(consentObj);
      localStorage.setItem("securelink_privacy_consent", JSON.stringify(consentObj));

      setStatusMessage(
        choice === "accepted"
          ? "✅ Votre choix a été enregistré côté serveur. Merci pour votre contribution souveraine à la sécurité collective !"
          : "✅ Votre choix a été enregistré. Vos analyses resteront strictement cantonnées au diagnostic immédiat."
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMessage(`❌ Impossible d'enregistrer le choix : ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeSample(e: React.FormEvent) {
    e.preventDefault();
    if (!revokeToken.trim()) return;

    setRevokeLoading(true);
    setRevokeResult(null);

    try {
      const res = await fetch("/api/privacy/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: revokeToken.trim() }),
      });

      const data = await res.json();
      setRevokeResult(data.message || "Demande de retrait traitée.");
      setRevokeToken("");
    } catch {
      setRevokeResult("Une erreur réseau est survenue lors de la demande de retrait.");
    } finally {
      setRevokeLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", color: "#0F172A", fontFamily: "system-ui, sans-serif" }}>
      {/* Header Navigation */}
      <header style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", padding: "14px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0F4C5C" }}>SecureLink</span>
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/analyse" style={{ fontSize: 13, fontWeight: 600, color: "#0F4C5C", textDecoration: "none" }}>
              Scanner un message
            </Link>
            <Link href="/stats" style={{ fontSize: 13, fontWeight: 600, color: "#64748B", textDecoration: "none" }}>
              Observatoire
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", backgroundColor: "#E0F2FE", color: "#0369A1", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, marginBottom: 12 }}>
            Version v2026.11 — Entrée en vigueur : Novembre 2026
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
            Politique de Confidentialité & Protection des Données
          </h1>
          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>
            La protection de votre vie privée et la souveraineté de vos données sont au cœur des engagements de SecureLink.
            Conformément aux directives de l&apos;ANTIC (Cameroun) et aux meilleures pratiques internationales (RGPD, Convention de Malabo).
          </p>
        </div>

        {/* Section 1 : Traitement Opérationnel */}
        <section style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "28px", marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: "#0F172A" }}>
            1. Traitement des analyses & Masquage immédiat
          </h2>
          <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, marginBottom: 14 }}>
            Lorsque vous soumettez un SMS, un message WhatsApp ou un lien suspect, notre scanner natif traite l&apos;information en mémoire vive afin de calculer le score de risque et les signaux d&apos;alerte en moins de 100 millisecondes.
          </p>
          <ul style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, paddingLeft: 20 }}>
            <li><strong>Masquage systématique :</strong> Les numéros de téléphone (+237 6...), emails, numéros de cartes bancaires et références de transaction (Orange Money, MTN MoMo) sont masqués de manière irréversible avant tout archivage.</li>
            <li><strong>Durée de conservation opérationnelle :</strong> 14 jours maximum afin de permettre l&apos;analyse des faux positifs, avant purge automatique.</li>
          </ul>
        </section>

        {/* Section 2 : Contribution Volontaire (COEUR DE LA DÉCISION PRODUIT) */}
        <section style={{ backgroundColor: "#F0FDF4", border: "2px solid #86EFAC", borderRadius: 12, padding: "28px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🤝</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#166534", margin: 0 }}>
              Contribution volontaire à l&apos;amélioration de SecureLink
            </h2>
          </div>

          <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.6, marginBottom: 16 }}>
            Pour développer un bouclier anti-fraude souverain adapté aux spécificités linguistiques et criminelles d&apos;Afrique francophone (arnaques aux faux recrutements, usurpations Mobile Money, faux visas), SecureLink entraîne des modèles d&apos;intelligence artificielle spécialisés.
          </p>

          <div style={{ backgroundColor: "#FFFFFF", padding: "18px", borderRadius: 8, border: "1px solid #BBF7D0", marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#14532D", marginBottom: 8 }}>
              Nos engagements stricts en cas d&apos;accord :
            </h3>
            <ul style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, paddingLeft: 18, margin: 0 }}>
              <li><strong>Dé-identification poussée :</strong> Suppression de tout identifiant, purge complète des paramètres d&apos;URL (`?token=...`, `?user=...`), et mise en quarantaine automatique en cas de doute.</li>
              <li><strong>Schéma privé inaccessible :</strong> Stockage dans un espace de données isolé (`private_ml`), totalement invisible et étanche aux requêtes publiques.</li>
              <li><strong>Rétention maximale :</strong> 18 mois, suivie d&apos;une destruction définitive.</li>
              <li><strong>Droit de retrait garanti :</strong> Un jeton cryptographique de 256 bits vous est remis lors de chaque analyse consentie pour supprimer votre contribution à tout moment.</li>
            </ul>
          </div>

          {/* Formulaire de choix explicite (sans pré-cochage) */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: 10, border: "1px solid #CBD5E1" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
              Votre choix concernant l&apos;entraînement IA :
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 14, color: "#0F172A" }}>
                <input
                  type="radio"
                  name="consent_choice"
                  checked={choice === "accepted"}
                  onChange={() => setChoice("accepted")}
                  style={{ marginTop: 3 }}
                />
                <span><strong>Oui, j&apos;accepte</strong> de contribuer volontairement à l&apos;amélioration de l&apos;IA SecureLink avec mes messages dé-identifiés.</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 14, color: "#0F172A" }}>
                <input
                  type="radio"
                  name="consent_choice"
                  checked={choice === "declined"}
                  onChange={() => setChoice("declined")}
                  style={{ marginTop: 3 }}
                />
                <span><strong>Non, je préfère</strong> que mes données ne soient pas utilisées à cette fin (SecureLink continuera de fonctionner normalement).</span>
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={handleSaveConsent}
                disabled={loading || choice === null}
                style={{
                  backgroundColor: choice === null ? "#94A3B8" : "#0F4C5C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: choice === null || loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Enregistrement..." : "Enregistrer ma préférence"}
              </button>

              {currentConsent && (
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  Statut actuel : <strong>{currentConsent.choice === "accepted" ? "Contribution acceptée" : "Refus (par défaut)"}</strong>
                </span>
              )}
            </div>

            {statusMessage && (
              <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, fontSize: 13, backgroundColor: statusMessage.startsWith("✅") ? "#ECFDF5" : "#FEF2F2", color: statusMessage.startsWith("✅") ? "#065F46" : "#991B1B" }}>
                {statusMessage}
              </div>
            )}
          </div>
        </section>

        {/* Section 3 : Exercice du Droit de Retrait */}
        <section style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#0F172A" }}>
            3. Exercer votre droit de retrait (Droit à l&apos;oubli)
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6, marginBottom: 16 }}>
            Si vous avez contribué et possédez un jeton de retrait (délivré lors d&apos;un scan avec consentement), collez-le ci-dessous pour supprimer immédiatement votre échantillon du corpus d&apos;apprentissage actif.
          </p>

          <form onSubmit={handleRevokeSample} style={{ display: "flex", gap: 10, flexWrap: "wrap", maxWidth: 600 }}>
            <input
              type="text"
              placeholder="Collez votre jeton de retrait (ex: SL-REV-...)"
              value={revokeToken}
              onChange={(e) => setRevokeToken(e.target.value)}
              style={{
                flex: 1,
                minWidth: 260,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={revokeLoading || !revokeToken.trim()}
              style={{
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: revokeLoading || !revokeToken.trim() ? "not-allowed" : "pointer",
              }}
            >
              {revokeLoading ? "Traitement..." : "Supprimer l&apos;échantillon"}
            </button>
          </form>

          {revokeResult && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, fontSize: 13, backgroundColor: "#F1F5F9", color: "#334155", borderLeft: "4px solid #0F4C5C" }}>
              {revokeResult}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}