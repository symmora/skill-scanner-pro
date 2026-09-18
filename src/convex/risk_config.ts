/**
 * Env-driven calibration for the risk engine.
 *
 * Reads process.env with safe defaults (see DEFAULT_RISK_CONFIG in
 * analyzer.ts) so the deployment can retune scoring without a code change.
 * In Convex these are deployment env vars: `npx convex env set KEY value`,
 * the dashboard, or synced from .env.local by `convex dev`.
 */

import { DEFAULT_RISK_CONFIG, type RiskConfig } from "./analyzer";

function numFromEnv(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function severityOverridesFromEnv(): Record<string, number> {
  const raw = process.env.RISK_RULE_SEVERITY_OVERRIDES;
  if (raw === undefined || raw.trim() === "") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        out[key] = Math.min(100, Math.max(0, Math.round(value)));
      }
    }
    return out;
  } catch {
    return {}; // malformed JSON → keep defaults
  }
}

export function loadRiskConfig(): RiskConfig {
  return {
    stackBonusPerExtraRule: numFromEnv(
      "RISK_STACK_BONUS_PER_RULE",
      DEFAULT_RISK_CONFIG.stackBonusPerExtraRule,
      0,
      50,
    ),
    maxStackBonus: numFromEnv(
      "RISK_STACK_BONUS_MAX",
      DEFAULT_RISK_CONFIG.maxStackBonus,
      0,
      100,
    ),
    scoreCap: numFromEnv("RISK_SCORE_CAP", DEFAULT_RISK_CONFIG.scoreCap, 50, 100),
    thresholds: {
      medium: numFromEnv(
        "RISK_MEDIUM_THRESHOLD",
        DEFAULT_RISK_CONFIG.thresholds.medium,
        1,
        99,
      ),
      high: numFromEnv(
        "RISK_HIGH_THRESHOLD",
        DEFAULT_RISK_CONFIG.thresholds.high,
        1,
        99,
      ),
      critical: numFromEnv(
        "RISK_CRITICAL_THRESHOLD",
        DEFAULT_RISK_CONFIG.thresholds.critical,
        1,
        99,
      ),
    },
    severityOverrides: severityOverridesFromEnv(),
  };
}
