# 🔄 Document de Flux Applicatif (Appflow & Parcours Système)
## Projet : SecureLink User Journeys & State Transitions
**Version :** 1.0.0  
**Statut :** Approuvé / En production  
**Date de révision :** Octobre 2026  

---

## 1. Vue d'Ensemble des Parcours

SecureLink propose deux points d'accès complémentaires adaptés aux réalités africaines :
1. **L'application Web (`/` et `/analyse`)** : Idéale pour les analyses approfondies, avec interface riche, visualisations, conseiller interactif et signalement communautaire.
2. **Le Bot WhatsApp (`+237 6 56 73 13 63`)** : Conçu pour l'usage quotidien instantané, accessible à 100% de la population sur smartphone sans rien installer.

---

## 2. Parcours Utilisateur Web

```mermaid
sequenceDiagram
    autonumber
    actor User as Utilisateur Web
    participant UI as Interface Web (Next.js)
    participant API as API Route (/api/analyze)
    participant Engine as Scanner In-Memory
    participant DB as Supabase (PostgreSQL)

    User->>UI: Accède à /analyse
    User->>UI: Colle un SMS ou un lien suspect
    User->>UI: Clique sur "Analyser maintenant"
    UI->>UI: Affiche état de chargement dynamique
    UI->>API: POST /api/analyze { content }
    API->>Engine: analyzeContent(content)
    Engine->>Engine: Analyse Message + URL + Corrélations + Risque
    Engine-->>API: Retourne AnalysisResult (score, signaux, actions)
    API-->>UI: Réponse JSON (200 OK)
    UI->>User: Affiche le diagnostic visuel (Badge couleur, Score, Actions)
    
    par Télémétrie en arrière-plan
        API-)DB: logAnalysisSafe (Anonymisation + Insert)
    end

    opt L'utilisateur a besoin d'aide
        User->>UI: Clique sur "Que faire si j'ai cliqué ?"
        UI->>API: POST /api/ask { question, context }
        API-->>UI: Réponse contextualisée du conseiller
        UI->>User: Affiche la procédure de sécurité par étapes
    end
```

---

## 3. Parcours Utilisateur WhatsApp

```mermaid
sequenceDiagram
    autonumber
    actor User as Citoyen sur WhatsApp
    participant Meta as Meta WhatsApp Cloud API
    participant Webhook as Webhook Next.js (/api/webhook/whatsapp)
    participant Engine as Scanner In-Memory
    participant DB as Supabase (PostgreSQL)

    User->>Meta: Envoie ou transfère un SMS ("Votre MoMo est bloqué...")
    Meta->>Webhook: Webhook POST payload (Message entrant)
    Webhook->>Meta: HTTP 200 {"status": "ok"} (Accusé sous 50ms)
    
    alt Message est une salutation ("Bonjour", "Aide", "Menu")
        Webhook->>Meta: Envoi du message de bienvenue et consignes
        Meta->>User: Reçoit le guide d'utilisation de SecureLink
    else Message suspect à analyser
        Webhook->>Engine: analyzeContent(textBody)
        Engine-->>Webhook: Résultat de diagnostic complet
        Webhook->>Meta: POST /messages (Rapport formaté avec émojis et conseils MoMo/OM)
        Meta->>User: Reçoit le rapport clair en 2 secondes
        
        par Sauvegarde Télémétrie
            Webhook-)DB: logAnalysisSafe(source: 'whatsapp')
        end
    end
```

---

## 4. Machine à États du Moteur d'Analyse (Pipeline Interne)

```mermaid
stateDiagram-v2
    [*] --> ReceptionMessage: Réception du texte brut
    
    state ReceptionMessage {
        [*] --> Nettoyage: Strip whitespace
        Nettoyage --> ExtractionURL: Regex URL detection
    }

    ExtractionURL --> AnalyseMessage: Détection signaux de texte
    note right of AnalyseMessage
        - Pression / Urgence (urgent, bloqué, immédiatement)
        - Éléments financiers (MoMo, OM, FCFA, virement, dépôt)
        - Données sensibles (PIN, code secret, USSD, *126#, *150#)
    end note

    ExtractionURL --> AnalyseURL: Si URL présente
    note right of AnalyseURL
        - IP dans le domaine (192.168... ou IP brute)
        - Port inhabituel (autre que 80 / 443)
        - Domaine ressemblant (similarity > 0.8)
        - Usurpation de marque camerounaise (momo, orange, douanes, campost)
    end note

    AnalyseMessage --> CorrelationSignaux: Fusion des signaux
    AnalyseURL --> CorrelationSignaux

    CorrelationSignaux --> CalculScore: Application des multiplicateurs de relations
    note right of CalculScore
        - Pression + Argent = 0.7
        - Pression + Faux site = 0.8
        - Demande PIN + Faux site = 0.9 (Harvesting critique)
    end note

    CalculScore --> FormulationExplications: Traduction en langage simple
    FormulationExplications --> DefinitionActions: Actions ciblées (Ex: "Changez votre code via *126#")
    DefinitionActions --> [*]: Objet AnalysisResult prêt
```

---

## 5. Gestion des Cas Limites (Edge Cases)

| Cas Limite | Détection | Comportement Système |
| :--- | :--- | :--- |
| **Texte vide ou espaces uniquement** | `content.trim().length === 0` | Retourne HTTP 400 avec message amical : *"Veuillez coller un texte ou un lien à vérifier."* |
| **URL malformée ou incomplète** (ex: `https://:8080`) | Analyseur URL échoue | Génère le signal `malformed_url` avec score modéré pour avertir l'utilisateur de la syntaxe anormale. |
| **Message WhatsApp non-textuel** (audio, image, vidéo) | `message.type !== "text"` | Répond poliment : *"SecureLink analyse actuellement les messages textes, SMS et liens. Envoyez-moi le texte du message."* |
| **Tentative de spam ou d'inondation** | Plus de 30 requêtes/minute | Le rate-limiter protège l'application et renvoie un statut HTTP 429 temporaire. |
| **Coupure réseau de la base de données** | Supabase injoignable | L'analyseur s'exécute quand même, répond à l'utilisateur sans aucune interruption (Fail-Safe), et logue un avertissement silencieux. |
