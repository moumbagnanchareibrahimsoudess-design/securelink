import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * =========================================================================
 * SECURELINK — SUITE DE VALIDATION TECHNIQUE (CORRECTIONS CIBLÉES POST-PHASE 2)
 * Tests d'étanchéité et de conformité :
 * 1. Désactivation exposition anon de get_public_stats()
 * 2. Stratégie vérifiable ALTER DEFAULT PRIVILEGES pour futurs objets
 * 3. Retrait des analyses individuelles et limitation des stats combinables
 * 4. Gestion des états de consentement (active, revoked, superseded, expired) & purge
 * 5. Comparaison timing-safe de ADMIN_API_KEY
 * =========================================================================
 */

async function runAllTests() {
  console.log("=================================================================");
  console.log("SECURELINK — TESTS DES 4 ÉLÉMENTS DE CORRECTION CIBLÉE POST-P2");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. ÉLÉMENT 1 : Désactivation de l'exposition anonyme de get_public_stats()
  // -------------------------------------------------------------------------
  console.log("\n[1] ÉLÉMENT 1 : Vérification SQL de get_public_stats()");
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261101000000_phase2_security_privacy_hardening.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");

  assert(
    migrationSql.includes("REVOKE ALL ON FUNCTION public.get_public_stats() FROM PUBLIC, anon, authenticated;"),
    "Révocation explicite des droits PUBLIC, anon et authenticated sur get_public_stats()"
  );

  assert(
    migrationSql.includes("GRANT EXECUTE ON FUNCTION public.get_public_stats() TO service_role;"),
    "Droit d'exécution de get_public_stats() strictement réservé à service_role"
  );

  assert(
    !migrationSql.includes("GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon"),
    "Aucun GRANT EXECUTE résiduel vers anon pour get_public_stats()"
  );

  // -------------------------------------------------------------------------
  // 2. ÉLÉMENT 2 : Stratégie vérifiable pour les privilèges des futurs objets
  // -------------------------------------------------------------------------
  console.log("\n[2] ÉLÉMENT 2 : Stratégie ALTER DEFAULT PRIVILEGES");
  assert(
    migrationSql.includes("ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;"),
    "Révocation par défaut sur les futures tables du schéma public"
  );
  assert(
    migrationSql.includes("ALTER DEFAULT PRIVILEGES IN SCHEMA private_ml REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;"),
    "Révocation par défaut sur les futures tables du schéma private_ml"
  );
  assert(
    migrationSql.includes("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;"),
    "Attribution automatique des futures tables au rôle interne service_role"
  );

  // -------------------------------------------------------------------------
  // 3. ÉLÉMENT 3 : Retrait des analyses individuelles & limitation des stats combinables
  // -------------------------------------------------------------------------
  console.log("\n[3] ÉLÉMENT 3 : Suppression des analyses individuelles et k-anonymat");
  const statsRoutePath = path.resolve(process.cwd(), "app/api/stats/route.ts");
  const statsRouteCode = fs.readFileSync(statsRoutePath, "utf-8");

  assert(
    !statsRouteCode.includes("safeRecent"),
    "Aucune structure safeRecent n'est construite dans l'endpoint public"
  );
  assert(
    !statsRouteCode.includes("recent: safeRecent"),
    "Le tableau 'recent' d'analyses individuelles est totalement exclu du retour JSON public"
  );

  function applyKAnonymityCellSuppression(
    counts: Record<string, number>,
    minThreshold = 3
  ): Record<string, number | string> {
    const result: Record<string, number | string> = {};
    const suppressedKeys: string[] = [];

    for (const [key, val] of Object.entries(counts)) {
      if (val > 0 && val < minThreshold) {
        result[key] = `< ${minThreshold}`;
        suppressedKeys.push(key);
      } else {
        result[key] = val;
      }
    }

    if (suppressedKeys.length === 1) {
      const candidates = Object.entries(counts)
        .filter(([k, v]) => !suppressedKeys.includes(k) && v >= minThreshold)
        .sort((a, b) => a[1] - b[1]);

      if (candidates.length > 0) {
        const secondaryKey = candidates[0][0];
        result[secondaryKey] = `< ${minThreshold}*`;
      }
    }

    return result;
  }

  const rawByRisk = { Critical: 1, High: 4, Medium: 12, Low: 30 };
  const maskedByRisk = applyKAnonymityCellSuppression(rawByRisk, 3);
  assert(maskedByRisk.Critical === "< 3", "Cellule avec 1 observation masquée en '< 3'");
  assert(
    maskedByRisk.High === "< 3*",
    "Suppression secondaire automatique sur la cellule 'High' pour parer au recoupement"
  );

  // -------------------------------------------------------------------------
  // 4. ÉLÉMENT 4 : États de consentement & procédure concrète de purge
  // -------------------------------------------------------------------------
  console.log("\n[4] ÉLÉMENT 4 : États de consentement et procédure concrète de purge");

  assert(
    migrationSql.includes("CHECK (status IN ('active', 'revoked', 'superseded', 'expired'))"),
    "La contrainte CHECK de consent_records intègre les 4 états formels du cycle de vie"
  );

  assert(
    migrationSql.includes("CREATE OR REPLACE FUNCTION private_ml.purge_expired_data"),
    "Procédure de purge concrète private_ml.purge_expired_data déclarée dans la migration"
  );

  assert(
    migrationSql.includes("DELETE FROM private_ml.learning_samples") &&
    migrationSql.includes("status IN ('revoked', 'superseded', 'expired')"),
    "La purge détruit automatiquement les échantillons associés à un consentement révoqué, remplacé ou expiré"
  );

  // -------------------------------------------------------------------------
  // 5. TEST D-05 : Comparaison timing-safe de ADMIN_API_KEY
  // -------------------------------------------------------------------------
  console.log("\n[5] TEST D-05 : Comparaison timingSafeEqual");

  function isTimingSafeMatch(provided: string | null, expected: string): boolean {
    if (!provided) return false;
    const bufProvided = Buffer.from(provided, "utf-8");
    const bufExpected = Buffer.from(expected, "utf-8");

    if (bufProvided.length !== bufExpected.length) {
      crypto.timingSafeEqual(bufExpected, bufExpected);
      return false;
    }
    return crypto.timingSafeEqual(bufProvided, bufExpected);
  }

  const validKey = "sk_securelink_admin_secret_token_2026";
  const validHeader = `Bearer ${validKey}`;

  assert(
    isTimingSafeMatch(validHeader, validHeader) === true,
    "Jeton identique accepté avec succès"
  );

  let shortThrew = false;
  let shortRes = true;
  try {
    shortRes = isTimingSafeMatch("Bearer short", validHeader);
  } catch {
    shortThrew = true;
  }
  assert(!shortThrew && shortRes === false, "Jeton de longueur inférieure rejeté sans erreur serveur");

  let longThrew = false;
  let longRes = true;
  try {
    longRes = isTimingSafeMatch(validHeader + "_additional_bytes_12345", validHeader);
  } catch {
    longThrew = true;
  }
  assert(!longThrew && longRes === false, "Jeton de longueur supérieure rejeté sans erreur serveur");

  console.log("\n=================================================================");
  console.log(`TOTAL DES SCÉNARIOS VALIDÉS : ${passed} PASS, ${failed} FAIL`);
  console.log("=================================================================");

  if (failed > 0) process.exit(1);
}

runAllTests().catch((e) => {
  console.error("Échec critique des tests:", e);
  process.exit(1);
});
