-- =========================================================================
-- SECURELINK — MIGRATION TRANSACTIONNELLE DE SÉCURITÉ CONSOLIDÉE (PHASE 2)
-- DATE : 2026-11-01
-- STATUT : PRÉPARÉE DANS LE DÉPÔT — NON EXÉCUTÉE
-- OBJECTIF : SCHÉMA PRIVÉ ML, REGISTRE DE CONSENTEMENT, FEEDBACK, RLS & PURGE
-- =========================================================================

BEGIN;

-- 1. CRÉATION DU SCHÉMA PRIVÉ D'APPRENTISSAGE (NON EXPOSÉ PAR POSTGREST)
CREATE SCHEMA IF NOT EXISTS private_ml;
REVOKE ALL ON SCHEMA private_ml FROM PUBLIC, anon, authenticated;

-- 2. TABLE DU REGISTRE DE CONSENTEMENT SERVEUR (SOURCE DE VÉRITÉ JURIDIQUE)
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_fingerprint VARCHAR(64) NOT NULL,            -- HMAC-SHA256 non réversible de l'empreinte client
  choice VARCHAR(10) NOT NULL CHECK (choice IN ('accepted', 'declined')),
  policy_version VARCHAR(20) NOT NULL,                 -- Ex: 'v2026.11'
  consent_version VARCHAR(20) NOT NULL,                -- Ex: 'c2026.11.1'
  purpose VARCHAR(50) NOT NULL,                        -- 'threat_intelligence_training_v1'
  client_timestamp TIMESTAMPTZ,                        -- Horodatage déclaré par le client
  server_timestamp TIMESTAMPTZ DEFAULT now() NOT NULL, -- Horodatage officiel serveur
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'revoked', 'superseded', 'expired')),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_fingerprint ON public.consent_records(subject_fingerprint);
CREATE INDEX IF NOT EXISTS idx_consent_lookup ON public.consent_records(id, status, choice);

-- 3. ALIGNEMENT DE LA TABLE ANALYSES
ALTER TABLE public.analyses 
  ADD COLUMN IF NOT EXISTS consent_proof_id UUID REFERENCES public.consent_records(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_analyses_consent_proof ON public.analyses(consent_proof_id);

-- 4. TABLE DU CORPUS D'APPRENTISSAGE PRIVÉ
CREATE TABLE IF NOT EXISTS private_ml.learning_samples (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  withdrawal_token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 du jeton secret 256 bits
  consent_proof_id UUID NOT NULL REFERENCES public.consent_records(id) ON DELETE RESTRICT,
  source VARCHAR(20) NOT NULL,                       -- 'web' | 'whatsapp'
  cleaned_text TEXT NOT NULL,                        -- Texte assaini et dé-identifié
  sanitized_url TEXT,                                -- URL sans query parameters ni tokens
  target_risk_level VARCHAR(20) NOT NULL,            -- 'Critical' | 'High' | 'Medium' | 'Low'
  target_risk_score INT NOT NULL,                    -- 0 à 100
  attack_category VARCHAR(50),                       -- Catégorie de menace qualifiée
  technical_signals JSONB NOT NULL DEFAULT '[]',     -- Signaux techniques purs
  relations JSONB NOT NULL DEFAULT '[]',             -- Corrélations
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'quarantined', 'revoked')),
  policy_version VARCHAR(20) NOT NULL,               -- Version de politique vérifiée
  consent_timestamp TIMESTAMPTZ NOT NULL,            -- Horodatage certifié
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ml_token_hash ON private_ml.learning_samples(withdrawal_token_hash);
CREATE INDEX IF NOT EXISTS idx_ml_status ON private_ml.learning_samples(status);

-- 5. REGISTRE D'AUDIT DU DROIT DE RETRAIT (AUCUNE DONNÉE PERSONNELLE)
CREATE TABLE IF NOT EXISTS private_ml.revocation_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  revocation_timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  status VARCHAR(30) NOT NULL -- 'purged_from_active_corpus'
);

-- 6. CRÉATION SÉCURISÉE DE LA TABLE FEEDBACK DANS LE SCHÉMA PUBLIC
CREATE TABLE IF NOT EXISTS public.feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  analysis_id BIGINT REFERENCES public.analyses(id) ON DELETE SET NULL,
  rating VARCHAR(10) NOT NULL CHECK (rating IN ('helpful', 'unhelpful')),
  comment VARCHAR(500),
  ip_fingerprint VARCHAR(64), -- Hachage pour limitation anti-abus
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_analysis_id ON public.feedback(analysis_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- 7. ACTIVATION SYSTÉMATIQUE DU ROW LEVEL SECURITY (RLS)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_ml.learning_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_ml.revocation_audit_log ENABLE ROW LEVEL SECURITY;

-- 8. GESTION PRÉCISE ET RATIONNELLE DES PERMISSIONS SQL
-- Révoquer explicitement les autorisations publiques excessives sur les objets existants
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA private_ml FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA private_ml FROM anon, authenticated, PUBLIC;

-- Accorder les droits strictement nécessaires au rôle serveur 'service_role'
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA private_ml TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA private_ml TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA private_ml TO service_role;

-- 8. bis. STRATÉGIE VÉRIFIABLE POUR LES PRIVILÈGES PAR DÉFAUT DES FUTURS OBJETS
-- Neutralise définitivement l'héritage de droits pour anon et authenticated sur toute création future
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml GRANT ALL ON FUNCTIONS TO service_role;

-- 9. CORRECTION DE LA MIGRATION HISTORIQUE (PÉRIMÈTRE RIGOUREUX)
-- Seules les analyses antérieures sans preuve formelle (consent_proof_id IS NULL) ont leur flag mis à false
UPDATE public.analyses
SET user_consent_training = false
WHERE consent_proof_id IS NULL
  AND (user_consent_training = true OR user_consent_training IS NULL);

-- 10. FONCTION RPC DE STATISTIQUES SÉCURISÉE (ACCESSIBLE UNIQUEMENT À SERVICE_ROLE)
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_total BIGINT;
  v_critical BIGINT;
  v_high BIGINT;
  v_medium BIGINT;
  v_low BIGINT;
  v_web BIGINT;
  v_whatsapp BIGINT;
  v_other BIGINT;
  v_helpful BIGINT;
  v_unhelpful BIGINT;
  v_total_fb BIGINT;
  v_sat_rate NUMERIC;
  v_min_threshold CONSTANT INT := 5; -- Seuil de k-anonymat statistique
BEGIN
  -- 1. Nombre total d'analyses
  SELECT COUNT(*) INTO v_total FROM public.analyses;

  -- Seuil minimal : si moins de 5 analyses au total, masquer les ventilations
  IF v_total < v_min_threshold THEN
    RETURN json_build_object(
      'summary', json_build_object(
        'totalAnalyses', v_total,
        'status', 'threshold_pending',
        'message', 'Volume insuffisant pour publication statistique agrégée (seuil minimum : 5).'
      )
    );
  END IF;

  -- 2. Ventilations par niveau de risque
  SELECT COUNT(*) INTO v_critical FROM public.analyses WHERE risk_level = 'Critical';
  SELECT COUNT(*) INTO v_high FROM public.analyses WHERE risk_level = 'High';
  SELECT COUNT(*) INTO v_medium FROM public.analyses WHERE risk_level = 'Medium';
  SELECT COUNT(*) INTO v_low FROM public.analyses WHERE risk_level = 'Low';

  -- 3. Ventilations exactes par canal
  SELECT COUNT(*) INTO v_web FROM public.analyses WHERE LOWER(source) = 'web';
  SELECT COUNT(*) INTO v_whatsapp FROM public.analyses WHERE LOWER(source) LIKE '%whatsapp%';
  SELECT COUNT(*) INTO v_other FROM public.analyses WHERE LOWER(source) NOT IN ('web') AND LOWER(source) NOT LIKE '%whatsapp%';

  -- 4. Indicateurs généraux de retours (Feedback)
  SELECT COUNT(*) INTO v_helpful FROM public.feedback WHERE rating = 'helpful';
  SELECT COUNT(*) INTO v_unhelpful FROM public.feedback WHERE rating = 'unhelpful';
  v_total_fb := v_helpful + v_unhelpful;

  IF v_total_fb > 0 THEN
    v_sat_rate := ROUND((v_helpful::numeric / v_total_fb::numeric) * 100);
  ELSE
    v_sat_rate := NULL;
  END IF;

  RETURN json_build_object(
    'summary', json_build_object(
      'totalAnalyses', v_total,
      'byRisk', json_build_object(
        'Critical', v_critical,
        'High', v_high,
        'Medium', v_medium,
        'Low', v_low
      ),
      'bySource', json_build_object(
        'web', v_web,
        'whatsapp', v_whatsapp,
        'other', v_other
      ),
      'highOrCriticalRate', ROUND(((v_critical + v_high)::numeric / v_total::numeric) * 100),
      'criticalRate', ROUND(((v_critical + v_high)::numeric / v_total::numeric) * 100),
      'feedback', json_build_object(
        'helpful', v_helpful,
        'unhelpful', v_unhelpful,
        'totalFeedback', v_total_fb,
        'satisfactionRate', v_sat_rate
      )
    )
  );
END;
$$;

-- RÈGLE ÉLÉMENT 1 : DÉSACTIVATION FORMELLE DE L'EXPOSITION DIRECTE VIA POSTGREST POUR ANON ET AUTHENTICATED
REVOKE ALL ON FUNCTION public.get_public_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO service_role;

-- 11. PROCÉDURE DE PURGE CONCRÈTE FONDÉE SUR LA FINALITÉ ET LE CYCLE DE VIE
CREATE OR REPLACE FUNCTION private_ml.purge_expired_data(
  p_retention_days_samples INT DEFAULT 548, -- 18 mois contractuels par défaut pour le modèle ML
  p_retention_days_analyses INT DEFAULT 30   -- 30 jours pour les traces opérationnelles
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private_ml
AS $$
DECLARE
  v_purged_samples BIGINT := 0;
  v_purged_analyses BIGINT := 0;
  v_expired_consents BIGINT := 0;
BEGIN
  -- 1. Purge des échantillons d'apprentissage ayant dépassé la durée maximale de conservation
  DELETE FROM private_ml.learning_samples
  WHERE created_at < now() - (p_retention_days_samples || ' days')::INTERVAL;
  GET DIAGNOSTICS v_purged_samples = ROW_COUNT;

  -- 2. Purge des échantillons rattachés à un consentement révoqué, remplacé ou expiré
  DELETE FROM private_ml.learning_samples
  WHERE consent_proof_id IN (
    SELECT id FROM public.consent_records
    WHERE status IN ('revoked', 'superseded', 'expired')
  );
  v_purged_samples := v_purged_samples + ROW_COUNT;

  -- 3. Purge des analyses opérationnelles expirées (minimisation opérationnelle)
  DELETE FROM public.analyses
  WHERE created_at < now() - (p_retention_days_analyses || ' days')::INTERVAL;
  GET DIAGNOSTICS v_purged_analyses = ROW_COUNT;

  -- 4. Actualisation des consentements arrivés à expiration
  UPDATE public.consent_records
  SET status = 'expired'
  WHERE server_timestamp < now() - (p_retention_days_samples || ' days')::INTERVAL
    AND status = 'active';
  GET DIAGNOSTICS v_expired_consents = ROW_COUNT;

  -- 5. Consignation neutre dans le registre d'audit légal
  INSERT INTO private_ml.revocation_audit_log (revocation_timestamp, status)
  VALUES (now(), 'routine_purge_executed');

  RETURN jsonb_build_object(
    'purged_samples', v_purged_samples,
    'purged_analyses', v_purged_analyses,
    'expired_consents', v_expired_consents,
    'executed_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION private_ml.purge_expired_data(INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private_ml.purge_expired_data(INT, INT) TO service_role;

COMMIT;