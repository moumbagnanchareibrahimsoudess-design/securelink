# 📄 Document d'Exigences Produit (PRD — Product Requirements Document)
## Projet : SecureLink — Bouclier Anti-Fraude & IA Cybersécurité pour l'Afrique
**Version :** 1.0.0  
**Statut :** Approuvé / En production  
**Date de révision :** Octobre 2026  
**Audience :** Fondateurs, Équipe Produit, Ingénieurs, Investisseurs, Partenaires Institutionnels (ANTIC, Opérateurs Télécoms)

---

## 1. Vision & Mission du Produit

### 1.1 Vision
Faire de **SecureLink** la plateforme de référence panafricaine de protection instantanée contre les cyber-escroqueries, l'ingénierie sociale et la fraude financière mobile (Mobile Money, Orange Money, faux recrutements, fausses bourses et faux visas).

### 1.2 Mission
Offrir à chaque citoyen, professionnel et PME en Afrique un bouclier numérique gratuit, ultra-rapide et accessible sans barrière technologique (directement via le Web et WhatsApp) capable de désamorcer une tentative d'arnaque en moins de 2 secondes.

---

## 2. Problématique & Opportunité de Marché

### 2.1 Le Problème sur le Terrain (Contexte Cameroun & CEMAC)
1. **Explosion de la fraude Mobile Money** : Les utilisateurs reçoivent quotidiennement de faux SMS de transferts erronés, des alertes mensongères de blocage de compte MoMo (`*126#`) ou Orange Money (`*150#`), incitant les victimes à composer des codes USSD pièges ou à vider leurs soldes.
2. **Ingénierie sociale ciblée** : Exploitation massive de la précarité des jeunes par des faux recrutements (concours douanes, police, armée, bourses d'études fantômes, offres d'emploi fictives).
3. **Analphabétisme numérique et manque de réflexes d'urgence** : La majorité des victimes n'ont aucun interlocuteur immédiat quand un incident survient et paniquent, renforçant le succès des arnaqueurs.
4. **Solutions occidentales inadaptées** : Les antivirus et filtres classiques (Norton, Bitdefender, Google Safe Browsing) ne détectent pas les scénarios locaux en français/Camfranglais et ignorent les subtilités du Mobile Money africain.

### 2.2 L'Opportunité Startup
- Plus de 15 millions de lignes mobiles actives au Cameroun, 85%+ des transactions passant par MTN MoMo et Orange Money.
- Adoption massive de **WhatsApp** comme canal numéro 1 de communication en Afrique.
- Opportunité unique de constituer **le premier jeu de données souverain (Proprietary Dataset)** sur la cyber-fraude en Afrique subsaharienne.

---

## 3. Proposition de Valeur & Différenciateurs

| Critère | Antivirus & Outils Classiques | SecureLink |
| :--- | :--- | :--- |
| **Canal d'accès** | Logiciel lourd à installer, PC/Desktop | **100% Web & WhatsApp en direct** |
| **Prise en compte Mobile Money** | Nulle (ignore MTN MoMo & Orange Money) | **Spécifique et ultra-ciblée (*126#, *150#)** |
| **Délai de réponse** | Variable | **Instantané (< 20 ms)** |
| **Conseils d'action immédiate** | Alertes techniques incompréhensibles | **Réflexes concrets en français simple** |
| **Coût pour l'utilisateur** | Souvent payant ou freemium agressif | **100% Gratuit pour le citoyen** |

---

## 4. Personas Utilisateurs

### Persona 1 : Marie, Commerçante à Yaoundé (42 ans)
- **Comportement** : Utilise MTN Mobile Money toute la journée pour ses ventes au marché. Reçoit des dizaines de SMS par jour.
- **Pain Point** : A peur de se faire vider son compte par un faux SMS de transfert erroné.
- **Usage SecureLink** : Transfère le SMS suspect directement dans sa conversation WhatsApp SecureLink et reçoit en 2 secondes l'instruction : *"Ne renvoyez rien, vérifiez votre solde via \*126#"*.

### Persona 2 : Samuel, Diplômé en recherche d'emploi à Douala (24 ans)
- **Comportement** : Postule sur Facebook, Telegram et WhatsApp à des offres d'emploi.
- **Pain Point** : Risque d'envoyer "15 000 FCFA de frais de dossier" à une fausse annonce de recrutement de la Douane.
- **Usage SecureLink** : Copie-colle le lien du formulaire de recrutement sur la plateforme web et découvre que le nom de domaine `douanes-recrutement.online` est un faux site pirate.

### Persona 3 : Responsable Sécurité d'une Institution Financière ou Régulateur (ANTIC / Banque)
- **Objectif** : Identifier en temps réel les campagnes de phishing massives ciblant les usagers camerounais pour ordonner des blocages de numéros ou de domaines.
- **Usage SecureLink** : Exploitation du tableau de bord de télémétrie des menaces émergentes.

---

## 5. Fonctionnalités Clés (Epics & User Stories)

### Epic 1 : Moteur de Diagnostic en Temps Réel (Scanner)
- **US1.1** : En tant qu'utilisateur, je peux coller un texte ou une URL suspecte pour obtenir immédiatement un score de risque (0 à 100) et un verdict clair (Faible, Modéré, Élevé, Critique).
- **US1.2** : En tant qu'utilisateur, je reçois une liste de preuves compréhensibles (ex : *"L'URL imite la marque MTN sur un domaine non officiel"* ou *"Pression urgente avec demande d'argent"*).
- **US1.3** : En tant qu'utilisateur, je reçois des actions recommandées directes adaptées au niveau de danger.

### Epic 2 : Assistant WhatsApp Cloud Bot
- **US2.1** : En tant qu'utilisateur, je peux enregistrer le numéro `+237 6 56 73 13 63` et lui transférer n'importe quel message sans créer de compte.
- **US2.2** : Le bot m'accueille avec un menu d'aide si je dis *"Bonjour"* ou *"Aide"*.
- **US2.3** : Le bot répond par un rapport structuré clair avec icônes visuelles (🔴, 🟠, 🟡, 🟢) et numéros d'urgence des opérateurs (MTN 8787, Orange 950).

### Epic 3 : Conseiller Interactif (SecureLink Advisor)
- **US3.1** : En tant qu'utilisateur ayant cliqué ou donné un mot de passe par erreur, je peux poser une question (*"J'ai cliqué que faire ?"* ou *"J'ai donné mon code secret"*).
- **US3.2** : Le conseiller me donne immédiatement la procédure de blocage d'urgence par étapes (1, 2, 3).

### Epic 4 : Télémétrie Sécurisée & Boucle de Données IA (Data Flywheel)
- **US4.1** : Tout message analysé est anonymisé à la volée (masquage systématique des numéros de téléphone et coordonnées bancaires).
- **US4.2** : L'analyse anonymisée est archivée de manière asynchrone dans la base de données PostgreSQL (Supabase) pour alimenter le dataset d'entraînement IA.
- **US4.3** : L'utilisateur peut donner son feedback (utile / non utile / faux positif) pour qualifier les données.

---

## 6. Exigences Non-Fonctionnelles

1. **Performance** : Temps de traitement de l'analyse inférieur à **50 millisecondes**.
2. **Disponibilité (High Availability)** : L'analyse doit continuer de fonctionner même si la base de données ou le réseau externe a une panne (pattern Fail-Safe).
3. **Coût d'exploitation** : 0 € en phase d'amorçage (tirant parti des couches gratuites Serverless de Vercel, Supabase et Meta Cloud API).
4. **Accessibilité & Langage** : Interface 100% en français, optimisée pour les smartphones d'entrée de gamme sur réseaux 3G/4G instables.

---

## 7. Indicateurs Clés de Performance (KPIs Startup)

| KPI | Objectif Phase 1 (Mois 1-3) | Objectif Phase 2 (Mois 6) |
| :--- | :--- | :--- |
| **Nombre d'analyses totales** | 5 000 | 50 000 |
| **Utilisateurs WhatsApp uniques** | 1 000 | 15 000 |
| **Taux de précision perçu (Feedback 👍)** | > 92% | > 96% |
| **Arnaques financières déjouées estimées** | > 500 cas | > 5 000 cas |
| **Volume du Dataset d'entraînement IA** | 2 500 entrées qualifiées | 25 000 entrées qualifiées |

---

## 8. Cadre Légal, Réglementaire & Éthique
- **Protection de la vie privée** : Masquage irréversible des données nominatives (PII) avant tout stockage.
- **Conformité nationale** : Alignement avec les directives de l'**ANTIC** (Agence Nationale des Technologies de l'Information et de la Communication du Cameroun) pour la prévention de la cybercriminalité.
- **Transparence** : L'utilisateur est informé que ses données anonymisées servent à protéger la communauté contre les arnaques.
