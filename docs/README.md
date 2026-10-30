# 📚 SecureLink — Suite Documentaire Officielle (Startup Documentation Suite)
> Plateforme intelligente de détection d'arnaques, phishing et cyber-fraude financière (Mobile Money, Orange Money) pour le Cameroun et l'Afrique.

Ce répertoire rassemble les 6 documents directeurs de conception, d'ingénierie et de stratégie produit de SecureLink :

---

## 📑 Sommaire des Documents

| N° | Document | Description & Rôle | Statut |
| :---: | :--- | :--- | :---: |
| **1** | [**Document d'Exigences Produit (PRD)**](./1_PRODUCT_REQUIREMENTS_DOCUMENT.md) | Vision, opportunité de marché, personas, fonctionnalités clés (Web & WhatsApp), KPIs et cadre réglementaire ANTIC. | ✅ Approuvé |
| **2** | [**Document d'Exigences Techniques (TRD)**](./2_TECHNICAL_REQUIREMENTS_DOCUMENT.md) | Architecture globale Serverless, stack Next.js 16 / TypeScript / Supabase, latence < 20ms, conformité PII et sécurité. | ✅ Approuvé |
| **3** | [**Document de Flux Applicatif (Appflow)**](./3_APPFLOW.md) | Diagrammes de séquence complets des parcours Web et WhatsApp, machine à états du scanner et gestion des cas limites. | ✅ Approuvé |
| **4** | [**Spécifications Design UX/UI**](./4_UX_UI_DESIGN.md) | Design system, tokens de couleurs de risque, wireframes de la carte de diagnostic et design conversationnel WhatsApp. | ✅ Approuvé |
| **5** | [**Architecture Backend & Schéma de Données**](./5_BACKEND_SCHEMA.md) | Modèle ERD, script DDL PostgreSQL (Supabase), indexation, sécurité RLS, typage TypeScript et contrats d'API JSON. | ✅ Approuvé |
| **6** | [**Plan d'Implémentation & Feuille de Route**](./6_IMPLEMENTATION_PLAN.md) | Rétrospective Phase 1, feuille de route détaillée (Growth WhatsApp, Feedback RLHF, Dashboard, Modèle IA souverain ONNX). | 🚀 En cours |

---

## 🚀 État Actuel du Déploiement
- **Application Web en Production :** [https://securelink-puce.vercel.app/](https://securelink-puce.vercel.app/)
- **Bot WhatsApp Officiel (Cameroun) :** `+237 6 56 73 13 63`
- **Base de Données de Télémétrie :** Supabase Cloud PostgreSQL (`analyses` en temps réel)
- **Coût d'Exploitation :** 0€ (100% Serverless, sans Railway, sans carte bancaire requise)
