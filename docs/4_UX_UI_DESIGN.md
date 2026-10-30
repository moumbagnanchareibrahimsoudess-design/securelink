# 🎨 Document de Spécifications Design UX/UI
## Projet : SecureLink Interface & Conversational Experience
**Version :** 1.0.0  
**Statut :** Approuvé / En production  
**Date de révision :** Octobre 2026  

---

## 1. Principes Fondamentaux de Conception

Lorsqu'un utilisateur consulte SecureLink, il est généralement en situation de **doute, de stress ou d'urgence financière** (peur d'avoir perdu son argent ou de rater une opportunité). 
Le design doit impérativement répondre à 3 piliers :
1. **La Clarté Immédiate :** Pas de jargon technique (éviter les termes incompréhensibles comme *"typosquattage DNS"* ; préférer *"Ce lien imite le site d'Orange Money"*).
2. **L'Apaisement par l'Action :** Une alerte anxiogène sans solution est néfaste. Chaque diagnostic doit fournir 2 ou 3 réflexes d'action immédiats et concrets.
3. **La Zéro Friction :** Pas d'inscription préalable obligatoire, pas de mot de passe, pas de carte bancaire. L'analyse doit être disponible au premier regard.

---

## 2. Design System & Palette Visuelle

### 2.1 Couleurs Sémantiques de Risque

| Niveau de Risque | Code HEX | Signification Psychologique | Émoji Associé |
| :--- | :--- | :--- | :---: |
| **Critique (Critical)** | `#EF4444` (Rouge vibrant) | Danger immédiat, escroquerie avérée | 🔴 |
| **Élevé (High)** | `#F97316` (Orange vif) | Forte probabilité d'arnaque, ne pas agir | 🟠 |
| **Modéré (Medium)** | `#EAB308` (Jaune ambré) | Éléments inhabituels nécessitant prudence | 🟡 |
| **Faible (Low)** | `#22C55E` (Vert émeraude) | Aucune menace hostile connue détectée | 🟢 |

### 2.2 Typographie & Hiérarchie
- **Police Principale :** `Geist Sans` (moderne, excellente lisibilité sur petits écrans LCD).
- **Police Technique & Codes :** `Geist Mono` (pour afficher les codes USSD comme `*126#` ou `*150#` et les URL).
- **Contraste Élevé :** Conforme aux normes WCAG AA pour une lecture parfaite en plein soleil au Cameroun.

---

## 3. Spécifications des Écrans Web

### 3.1 Page d'Accueil & Zone d'Analyse (`/` et `/analyse`)
- **Zone de saisie principale :** Champ de texte large avec placeholder rassurant :  
  *« Collez ici un SMS suspect (ex: transfert MoMo, gain de loterie, offre d'emploi) ou un lien web à vérifier... »*
- **Bouton d'action principal :** Bouton large avec icône de bouclier `ShieldCheck` : *"Analyser le message (Gratuit)"*.
- **Raccourcis en 1 clic :** Exemples types pré-remplis pour tester (*"Faux transfert MoMo"*, *"Loterie gagnante"*, *"Lien officiel MTN"*).

### 3.2 Carte de Diagnostic (Résultat de l'analyse)
Dès l'analyse terminée, affichage dynamique de la carte de synthèse :
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 RISQUE CRITIQUE (Score : 86 / 100)                      │
│ ⚠️ Ce message présente de fortes caractéristiques d'escroquerie. │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Éléments détectés :                                      │
│ • L'URL utilise la marque 'MOMO' sur un domaine non officiel │
│ • Le mot 'urgent' a été détecté dans le message             │
│ • Le mot 'fcfa' a été détecté dans le message               │
├─────────────────────────────────────────────────────────────┤
│ 🚨 VOS RÉFLEXES IMMÉDIATS :                                 │
│ 👉 Ne cliquez sur aucun lien.                               │
│ 👉 Ne transmettez jamais votre code PIN secret.             │
│ 👉 Vérifiez votre solde directement via *126# ou *150#.     │
├─────────────────────────────────────────────────────────────┤
│ 💬 Besoin d'aide immédiate ?                                │
│ [ Que faire si j'ai cliqué ? ]  [ J'ai donné mon mot de passe ]│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Call-To-Action WhatsApp (Bouton flottant & QR Code)
- **Bouton flottant :** En bas à droite de l'écran, bouton vert aux couleurs de WhatsApp : *"Scanner sur WhatsApp (+237 6 56 73 13 63)"*.
- **Section Dédiée sur la Landing Page :**  
  *« Pas envie d'ouvrir le navigateur ? Enregistrez SecureLink dans vos contacts WhatsApp et transférez-lui directement vos SMS suspects ! »* avec affichage du **QR Code** scannable.

---

## 4. Design Conversationnel WhatsApp (CUI — Conversational UI)

WhatsApp impose des contraintes visuelles fortes (absence de boutons HTML, format texte brut enrichi). Le format des messages SecureLink respecte une grille rigoureuse :

### 4.1 Structure du Rapport WhatsApp
1. **En-tête officiel avec séparateur :**
   ```
   🛡️ *SECURELINK — DIAGNOSTIC ANTI-FRAUDE*
   ━━━━━━━━━━━━━━━━━━━━
   ```
2. **Verdict avec émoji de statut :**
   ```
   🔴 *VERDICT : RISQUE CRITIQUE (86/100)*
   ⚠️ *Ce message présente de fortes caractéristiques d'escroquerie.*
   ```
3. **Preuves factuelles (3 points maximum) :**
   ```
   🔍 *Éléments détectés :*
   • L'URL imite la marque MOMO sur un faux domaine
   • Fausse alerte d'urgence pour forcer une action rapide
   ```
4. **Réflexes d'urgence locaux :**
   ```
   🚨 *VOS RÉFLEXES IMMÉDIATS :*
   👉 Ne cliquez sur aucun lien.
   👉 Ne composez aucun code USSD dicté au téléphone.
   👉 En cas de doute, appelez MTN au 8787 ou Orange au 950.
   ```
5. **Pied de page de réassurance :**
   ```
   ━━━━━━━━━━━━━━━━━━━━
   🔒 _Vos données ont été anonymisées. Pour vérifier un autre message, transférez-le ici._
   ```
