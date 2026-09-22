"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "L'analyse est-elle totalement gratuite ?",
      a: "Oui, SecureLink est accessible gratuitement et sans inscription pour vous permettre de vérifier instantanément un message ou un lien suspect en cas de doute.",
    },
    {
      q: "Que faire si j'ai déjà cliqué sur le lien reçu ?",
      a: "Dès que vous analysez le message, notre conseiller interactif vous fournit des fiches réflexes d'urgence : déconnexion immédiate, vérification des fichiers téléchargés, et démarches bancaires prioritaires.",
    },
    {
      q: "Mes données personnelles sont-elles protégées ?",
      a: "Absolument. Conformément au RGPD, notre filtre d'anonymisation automatique masque systématiquement les numéros de téléphone, les adresses email et les coordonnées bancaires avant tout enregistrement en base de données.",
    },
    {
      q: "Quelles sont les bases de sécurité consultées lors d'une analyse ?",
      a: "SecureLink interroge en temps réel les bases de référence mondiales : VirusTotal, Google Web Risk, URLhaus et PhishTank, en plus de nos moteurs sémantiques propriétaires.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Barre de navigation */}
      <nav
        style={{
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0F4C5C",
                letterSpacing: -0.5,
              }}
            >
              SecureLink
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: "#ECFDF5",
                color: "#047857",
                padding: "2px 8px",
                borderRadius: 9999,
                border: "1px solid #A7F3D0",
              }}
            >
              Protection Active
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", gap: 20 }} className="desktop-links">
              <a
                href="#fonctionnement"
                style={{ textDecoration: "none", color: "#475569", fontSize: 14, fontWeight: 500 }}
              >
                Comment ça marche
              </a>
              <a
                href="#menaces"
                style={{ textDecoration: "none", color: "#475569", fontSize: 14, fontWeight: 500 }}
              >
                Menaces détectées
              </a>
              <a
                href="#securite"
                style={{ textDecoration: "none", color: "#475569", fontSize: 14, fontWeight: 500 }}
              >
                Confidentialité & RGPD
              </a>
            </div>

            <Link
              href="/analyse"
              style={{
                textDecoration: "none",
                backgroundColor: "#0F4C5C",
                color: "#FFFFFF",
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 4px rgba(15,76,92,0.2)",
              }}
            >
              <span>Lancer l&apos;analyseur</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Section Héro */}
      <section
        style={{
          padding: "clamp(48px, 8vw, 84px) 24px",
          background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#E0F2FE",
              color: "#0F4C5C",
              padding: "6px 14px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            <span>🛡️</span>
            <span>Bouclier citoyen contre les arnaques et le phishing</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: -1,
              color: "#0F172A",
              marginBottom: 20,
            }}
          >
            Ne doutez plus. <br />
            <span style={{ color: "#0F4C5C" }}>Vérifiez chaque message</span> avant d&apos;agir.
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 3.5vw, 19px)",
              color: "#64748B",
              lineHeight: 1.6,
              maxWidth: 680,
              margin: "0 auto 32px auto",
            }}
          >
            Faux SMS de livraison, fausses alertes bancaires, liens piégés : analysez n&apos;importe
            quel message en quelques secondes et dialoguez avec un conseiller d&apos;urgence en cas
            de doute.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 48,
            }}
          >
            <Link
              href="/analyse"
              style={{
                textDecoration: "none",
                backgroundColor: "#0F4C5C",
                color: "#FFFFFF",
                padding: "14px 28px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(15,76,92,0.3)",
              }}
            >
              <span>Tester un message ou un lien</span>
              <span style={{ fontSize: 18 }}>➔</span>
            </Link>

            <a
              href="#fonctionnement"
              style={{
                textDecoration: "none",
                backgroundColor: "#F1F5F9",
                color: "#334155",
                padding: "14px 24px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>Découvrir le fonctionnement</span>
              <span>↓</span>
            </a>
          </div>

          {/* Démonstration visuelle en carte (Aperçu) */}
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 16,
              padding: 24,
              textAlign: "left",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: 12,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                Exemple d&apos;analyse en direct
              </span>
              <span style={{ fontSize: 12, color: "#16803C", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16803C" }} />
                Résultat instantané
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#F8FAFC",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                color: "#1E293B",
                marginBottom: 16,
                borderLeft: "4px solid #0F4C5C",
              }}
            >
              « Chronopost : Votre colis n°FR4920 est bloqué. Réglez 1,99€ de frais avant 18h sur chrono-suivi-douane.com »
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🔴</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#C62828" }}>RISQUE CRITIQUE (88 / 100)</span>
            </div>

            <div style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 9999, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ width: "88%", height: "100%", backgroundColor: "#C62828" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#475569" }}>
              <div>• <strong>Pression temporelle :</strong> sentiment d&apos;urgence artificiel (&quot;avant 18h&quot;).</div>
              <div>• <strong>Usurpation de domaine :</strong> faux site ne correspondant pas à chronopost.fr.</div>
              <div>• <strong>Conseil d&apos;urgence :</strong> Ne cliquez pas et ne transmettez aucune coordonnée bancaire.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Comment ça marche */}
      <section
        id="fonctionnement"
        style={{
          padding: "clamp(48px, 6vw, 72px) 24px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
              Comment fonctionne SecureLink ?
            </h2>
            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
              Une protection puissante accessible à tous en 3 étapes simples et immédiates.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#E0F2FE",
                  color: "#0F4C5C",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>
                Collez votre message
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                Copiez le SMS, l&apos;email, le message WhatsApp ou le lien web qui vous semble douteux et déposez-le dans notre zone d&apos;analyse.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#E0F2FE",
                  color: "#0F4C5C",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>
                Scan multi-moteurs en direct
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                Nos moteurs analysent la sémantique, la structure du domaine et interrogent en parallèle les bases mondiales (VirusTotal, Google, URLhaus, PhishTank).
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                padding: 28,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: "#E0F2FE",
                  color: "#0F4C5C",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>
                Verdict & Conseiller d&apos;urgence
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                Vous obtenez un score clair, des recommandations concrètes et pouvez dialoguer avec notre conseiller pour savoir exactement quoi faire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 : Les menaces neutralisées */}
      <section
        id="menaces"
        style={{
          padding: "clamp(48px, 6vw, 72px) 24px",
          backgroundColor: "#F8FAFC",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
              Ce que SecureLink neutralise au quotidien
            </h2>
            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
              Les cybercriminels perfectionnent leurs pièges : nous vous aidons à les repérer immédiatement.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📦</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Faux colis & transporteurs</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                SMS prétendant un problème d&apos;adresse ou des frais de douane imprévus (Chronopost, Colissimo, Mondial Relay).
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏦</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Alertes bancaires frauduleuses</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Messages alarmistes de « tentative de connexion suspecte » vous incitant à donner vos identifiants ou votre code secret.
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔐</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Usurpation de comptes</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Fausses pages de connexion imitant les impôts, l&apos;Assurance Maladie (Ameli), Netflix ou vos réseaux sociaux.
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📱</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Fausses amendes & urgences</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Fausses contraventions ANTAI ou arnaques de faux proches en détresse sur WhatsApp réclamant de l&apos;argent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 : Confidentialité & RGPD */}
      <section
        id="securite"
        style={{
          padding: "clamp(48px, 6vw, 72px) 24px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#ECFDF5",
              color: "#047857",
              padding: "4px 12px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
              border: "1px solid #A7F3D0",
            }}
          >
            <span>🔒</span>
            <span>Conformité RGPD & Respect de la vie privée</span>
          </div>

          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>
            Vos données personnelles restent strictement confidentielles.
          </h2>

          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6, marginBottom: 32 }}>
            Nous savons que les messages que vous analysez peuvent contenir des informations sensibles.
            C&apos;est pourquoi notre moteur applique un <strong>masquage automatique irréversible</strong> :
            les numéros de téléphone, les adresses email et les coordonnées bancaires sont automatiquement
            remplacés par des mentions masquées avant tout archivage.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 24,
              fontSize: 14,
              color: "#334155",
              fontWeight: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#16803C" }}>✓</span>
              <span>Anonymisation automatique</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#16803C" }}>✓</span>
              <span>Zéro revente de données</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#16803C" }}>✓</span>
              <span>Connexions chiffrées de bout en bout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 : FAQ */}
      <section
        style={{
          padding: "clamp(48px, 6vw, 72px) 24px",
          backgroundColor: "#F8FAFC",
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
              Foire Aux Questions
            </h2>
            <p style={{ color: "#64748B", fontSize: 15 }}>
              Tout ce que vous devez savoir avant d&apos;utiliser SecureLink.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    textAlign: "left",
                    backgroundColor: "transparent",
                    border: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: 18, color: "#64748B" }}>
                    {openFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === idx && (
                  <div
                    style={{
                      padding: "0 20px 16px 20px",
                      fontSize: 14,
                      color: "#64748B",
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière d'appel à l'action finale */}
      <section
        style={{
          padding: "clamp(48px, 6vw, 72px) 24px",
          backgroundColor: "#0F4C5C",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, marginBottom: 14, letterSpacing: -0.5 }}>
            Un doute sur un SMS ou un email reçu ?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28, lineHeight: 1.5 }}>
            Ne prenez aucun risque financier ou personnel. Analysez-le en 5 secondes avec SecureLink.
          </p>
          <Link
            href="/analyse"
            style={{
              textDecoration: "none",
              backgroundColor: "#FFFFFF",
              color: "#0F4C5C",
              padding: "14px 28px",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <span>Accéder à l&apos;analyseur gratuit</span>
            <span>➔</span>
          </Link>
        </div>
      </section>

      {/* Pied de page (Footer) */}
      <footer
        style={{
          padding: "24px",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          textAlign: "center",
          fontSize: 13,
          color: "#94A3B8",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>🛡️</span>
            <span style={{ fontWeight: 700, color: "#0F4C5C" }}>SecureLink</span>
            <span>— Plateforme de détection et prévention de cyber-fraude</span>
          </div>
          <div>
            Conforme RGPD • Données anonymisées • Moteurs certifiés
          </div>
        </div>
      </footer>
    </div>
  );
}