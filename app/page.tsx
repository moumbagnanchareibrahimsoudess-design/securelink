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
      q: "Que faire en cas de faux dépôt Mobile Money ou si j'ai donné mon code PIN ?",
      a: "Notre conseiller interactif vous guide immédiatement : composez le *126# (MTN) ou le *150# (Orange) pour modifier d'urgence votre code secret, contactez le service client au 8787 (MTN) ou 950 (Orange) pour faire suspendre le compte, et ne renvoyez jamais d'argent manuellement.",
    },
    {
      q: "Mes données personnelles et mes numéros sont-ils protégés ?",
      a: "Absolument. Conformément aux exigences de confidentialité et de protection des données, notre filtre d'anonymisation automatique masque systématiquement les numéros camerounais (+237 6...), les adresses email et les informations bancaires avant tout enregistrement.",
    },
    {
      q: "Quelles sont les institutions et bases de sécurité consultées ?",
      a: "SecureLink interroge en temps réel les bases de référence mondiales (VirusTotal, Google Web Risk, URLhaus, PhishTank) et applique les règles de sécurité recommandées par l'ANTIC (Agence Nationale des TIC du Cameroun).",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
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
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#0F4C5C",
                letterSpacing: -0.5,
              }}
            >
              SecureLink
            </span>
            <span
              className="hidden sm:inline-flex"
              style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: "#ECFDF5",
                color: "#047857",
                padding: "2px 8px",
                borderRadius: 9999,
                border: "1px solid #A7F3D0",
                whiteSpace: "nowrap",
              }}
            >
              Cameroun & Afrique
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="hidden md:flex" style={{ gap: 20 }}>
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
                Menaces ciblées
              </a>
              <a
                href="#securite"
                style={{ textDecoration: "none", color: "#475569", fontSize: 14, fontWeight: 500 }}
              >
                Confidentialité & ANTIC
              </a>
            </div>

            <Link
              href="/analyse"
              style={{
                textDecoration: "none",
                backgroundColor: "#0F4C5C",
                color: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
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
              borderRadius: 20,
              fontSize: "clamp(12px, 3.2vw, 13px)",
              fontWeight: 600,
              marginBottom: 20,
              maxWidth: "100%",
              boxSizing: "border-box",
              lineHeight: 1.4,
              textAlign: "left",
            }}
          >
            <span style={{ flexShrink: 0 }}>🛡️</span>
            <span>Protection contre les fraudes Mobile Money, faux concours et arnaques numériques</span>
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
            <span style={{ color: "#0F4C5C" }}>Vérifiez chaque message suspect</span> avant d&apos;agir.
          </h1>

          <p
            style={{
              fontSize: "clamp(16px, 3.5vw, 19px)",
              color: "#64748B",
              lineHeight: 1.6,
              maxWidth: 700,
              margin: "0 auto 32px auto",
            }}
          >
            Arnaques <strong>Mobile Money (MTN MoMo & Orange Money)</strong>, faux concours de recrutement,
            fausses bourses d&apos;études et liens piégés : SecureLink analyse vos SMS et messages WhatsApp
            en quelques secondes et vous guide pas à pas.
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
                Exemple d&apos;analyse : Arnaque Mobile Money
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
                wordBreak: "break-word",
              }}
            >
              « Dépôt de 45 000 FCFA reçu de 690123456. Erreur de transfert, veuillez annuler la transaction et renvoyer les fonds sur momo-annuler-transfert.cm »
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>🔴</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#C62828" }}>RISQUE CRITIQUE (90 / 100)</span>
            </div>

            <div style={{ height: 6, backgroundColor: "#E2E8F0", borderRadius: 9999, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ width: "90%", height: "100%", backgroundColor: "#C62828" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#475569" }}>
              <div>• <strong>Faux Dépôt Mobile Money :</strong> tentative classique d&apos;escroquerie au faux SMS entrant.</div>
              <div>• <strong>Pression & Lien frauduleux :</strong> faux site ne provenant ni de MTN ni d&apos;Orange.</div>
              <div>• <strong>Consigne d&apos;urgence :</strong> Ne renvoyez rien ! Vérifiez votre solde réel via *126# ou *150# et contactez le 8787 ou 950.</div>
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
                Copiez le SMS, le message WhatsApp de faux transfert MoMo, ou l&apos;offre de recrutement suspecte et déposez-le dans notre analyseur.
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
                Scan multi-moteurs contextualisé
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                Nos algorithmes analysent les demandes de codes PIN, les mentions Mobile Money, les montants en FCFA et croisent les liens avec les bases de menaces mondiales.
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
                Conseils d&apos;urgence adaptés
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                En cas de doute, dialoguez avec le conseiller pour savoir comment changer votre code PIN (*126#, *150#) ou contacter votre opérateur (8787, 950).
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
              Les fraudes neutralisées au Cameroun & en Afrique
            </h2>
            <p style={{ color: "#64748B", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
              Des arnaques sophistiquées qui ciblent les portefeuilles mobiles et les chercheurs d&apos;emploi.
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
              <div style={{ fontSize: 28, marginBottom: 12 }}>📱</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Arnaques Mobile Money (MoMo & OM)</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Faux dépôts réclamant un renvoi d&apos;argent, faux messages de compte bloqué et manipulations par codes USSD (*126#, *150#).
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💼</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Faux Concours & Recrutements</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Fausses offres d&apos;emploi pour les Douanes, la Police, l&apos;armée ou des ONG exigeant des « frais de dossier » ou d&apos;examen par Mobile Money.
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✈️</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Fausses bourses d&apos;études & Visas</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Promesses de bourses d&apos;études ou de contrats de travail pour le Canada et l&apos;Europe exigeant des transferts préalables en FCFA.
              </p>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Urgences WhatsApp & Tontines en ligne</h4>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                Messages usurpant l&apos;identité d&apos;un proche en détresse médicale ou systèmes pyramidaux promettant de doubler vos dépôts MoMo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 : Confidentialité & ANTIC */}
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
            <span>Respect strict de la vie privée & Démarches ANTIC</span>
          </div>

          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>
            Vos données personnelles restent strictement protégées.
          </h2>

          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.6, marginBottom: 32 }}>
            Les messages analysés peuvent contenir vos numéros de téléphone ou des informations sensibles.
            SecureLink applique un <strong>masquage automatique irréversible</strong> :
            les numéros camerounais (+237 6...), les adresses email et les coordonnées bancaires sont
            systématiquement remplacés par des mentions masquées avant tout archivage.
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
              <span>Anonymisation automatique des numéros locaux (+237)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#16803C" }}>✓</span>
              <span>Zéro revente ou partage de données</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#16803C" }}>✓</span>
              <span>Conseils alignés sur les recommandations de l&apos;ANTIC</span>
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
              Tout ce que vous devez savoir pour sécuriser vos transactions et vos messages.
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
            Un doute sur un SMS ou un message WhatsApp reçu ?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 28, lineHeight: 1.5 }}>
            Ne perdez pas vos économies. Analysez le message en 5 secondes avec SecureLink avant d&apos;envoyer le moindre FCFA.
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

      {/* Section WhatsApp Bot */}
      <section
        style={{
          padding: "50px 20px",
          backgroundColor: "#F0FDF4",
          borderTop: "1px solid #DCFCE7",
          borderBottom: "1px solid #DCFCE7",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ flex: "1 1 500px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#DCFCE7",
                color: "#166534",
                padding: "4px 10px",
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              💬 Numéro Officiel WhatsApp
            </div>
            <h2
              style={{
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 10,
              }}
            >
              Scannez vos SMS directement sur WhatsApp
            </h2>
            <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>
              Pas envie d&apos;ouvrir le navigateur ? Ajoutez SecureLink à vos contacts au <strong>+237 6 56 73 13 63</strong> et transférez-lui directement n&apos;importe quel message ou lien suspect pour recevoir le diagnostic.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://wa.me/237656731363?text=Bonjour"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#25D366",
                  color: "#FFFFFF",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 6px rgba(37,211,102,0.3)",
                }}
              >
                <span>💬 Ouvrir la discussion (+237 6 56 73 13 63)</span>
              </a>
              <Link
                href="/analyse"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#0F4C5C",
                  border: "1px solid #CBD5E1",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Utiliser le Scanner Web
              </Link>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "20px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
              +237 6 56 73 13 63
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              Enregistrez le contact sous &ldquo;SecureLink&rdquo;
            </div>
          </div>
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
            <span>— Plateforme de détection et prévention de cyber-fraude (Cameroun & Afrique)</span>
          </div>
          <div>
            Protection des données • Respect de la vie privée • Conseils ANTIC & Opérateurs
          </div>
        </div>
      </footer>

      {/* Bouton Flottant WhatsApp */}
      <a
        href="https://wa.me/237656731363?text=Bonjour"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 99,
          backgroundColor: "#25D366",
          color: "#FFFFFF",
          borderRadius: 9999,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: 13,
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 18 }}>💬</span>
        <span>WhatsApp Direct</span>
      </a>
    </div>
  );
}