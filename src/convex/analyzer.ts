/**
 * Heuristic analyzer that scores agent skills / tools / MCP configs for
 * manipulative behavior ("malicious movements") and hidden tooling.
 *
 * Pure functions only — no Convex imports, so it stays unit-testable and
 * the mutations in skills.ts stay thin.
 */

import type { Finding, RiskLevel, SkillKind } from "./schema";

export interface SkillInput {
  name: string;
  description?: string;
  kind: SkillKind;
  /** Raw manifest / definition text pasted or uploaded by the user. */
  body: string;
}

export interface SkillAnalysis {
  riskScore: number;
  riskLevel: RiskLevel;
  findings: Finding[];
}

interface Rule {
  id: string;
  title: string;
  /** Why this pattern is dangerous, shown to the user. */
  detail: string;
  /** Weight 0-100. The risk score is the max severity across findings,
   *  with a small stacking bonus for multiple distinct rule hits. */
  severity: number;
  /** Each match becomes one evidence string. */
  patterns: RegExp[];
}

/** Deployment-tunable calibration for the scoring model. */
export interface RiskConfig {
  /** Bonus per additional distinct rule beyond the first hit. */
  stackBonusPerExtraRule: number;
  /** Upper bound on the total stacking bonus. */
  maxStackBonus: number;
  /** Hard cap for the final risk score. */
  scoreCap: number;
  /** Score → risk class mapping. Bands: 0 | 1–30 | 31–60 | 61–75 | 76–90 | 91–100. */
  thresholds: {
    medium: number;
    elevated: number;
    high: number;
    critical: number;
  };
  /** Per-rule severity overrides, keyed by rule id. */
  severityOverrides: Record<string, number>;
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  stackBonusPerExtraRule: 6,
  maxStackBonus: 24,
  scoreCap: 100,
  thresholds: { medium: 31, elevated: 61, high: 76, critical: 91 },
  severityOverrides: {},
};

function toRiskLevel(score: number, config: RiskConfig): RiskLevel {
  const { medium, elevated, high, critical } = config.thresholds;
  if (score >= critical) return "critical";
  if (score >= high) return "high";
  if (score >= elevated) return "elevated";
  if (score >= medium) return "medium";
  if (score > 0) return "low";
  return "none";
}

const RULES: Rule[] = [
  // ── Obfuscation ────────────────────────────────────────────────────────
  {
    id: "CMD_OBFUSCATION",
    title: "Obfuscated shell command",
    detail:
      "Base64/hex blobs piped into an interpreter hide what actually runs. Classic way to smuggle a payload past human review.",
    severity: 85,
    patterns: [
      /echo\s+[A-Za-z0-9+/=]{24,}\s*\|\s*base64\s+-d\s*\|\s*(ba)?sh\b/gi,
      /base64\s+-d\s*<<[^|]*\|\s*(ba)?sh\b/gi,
      /printf\s+['"][0-9a-fA-F\\x]{40,}['"].*\|\s*(ba)?sh\b/gi,
      /\b(bash|sh|python3?|node)\s+-c\s+['"][^'"]*(\\x[0-9a-fA-F]{2}){8,}/gi,
      /eval\s*\(\s*atob\s*\(/gi,
    ],
  },
  {
    id: "ENCODED_SECRETS",
    title: "Encoded blob that looks like a secret",
    detail:
      "A long base64/hex literal may conceal credentials or a second-stage payload. Decode it manually before trusting the skill.",
    severity: 55,
    patterns: [
      /[A-Za-z0-9+/]{48,}={0,2}/g,
      /\b(?:[0-9a-fA-F]{2}){32,}\b/g,
    ],
  },

  // ── Exfiltration ───────────────────────────────────────────────────────
  {
    id: "EXFIL_HTTP",
    title: "Sends data to an external endpoint",
    detail:
      "curl/wget/POST to a remote host can quietly ship your files, env vars, or conversation history to an attacker-controlled server.",
    severity: 75,
    patterns: [
      /\bcurl\b[^|;&]*-X\s*(POST|PUT)/gi,
      /\b(wget|curl)\b[^|;&]*https?:\/\//gi,
      /\b(fetch|axios)\s*\(\s*['"]https?:\/\//gi,
      /requests\.post\s*\(/gi,
      /\bnc\s+(-\w+\s+)*\d+\.\d+\.\d+\.\d+/gi,
    ],
  },
  {
    id: "EXFIL_ENV",
    title: "Reads environment variables / secrets",
    detail:
      "Reading env, .env, or credential files lets a skill harvest API keys — pair that with any network call and it is exfiltration.",
    severity: 70,
    patterns: [
      /process\.env\b/gi,
      /\bimport\s+os\b.*environ/gi,
      /os\.environ/gi,
      /printenv|env\s*\|/gi,
      /~\/\.?(ssh|aws|netrc|npmrc|gnupg)/gi,
      /\.env\b/gi,
      /id_rsa|credentials\b|secret[_-]?key\b/gi,
    ],
  },
  {
    id: "FILE_SWEEP",
    title: "Broad filesystem access",
    detail:
      "Recursive reads/writes over home or root directories are how skills gather material to exfiltrate — and how they can destroy data.",
    severity: 60,
    patterns: [
      /\bfind\s+\/|\bfind\s+~/gi,
      /\bdu\s+-[a-zA-Z]*a/gi,
      /\bchmod\s+(-\w+\s+)*777\b/gi,
      /rm\s+-rf\s+(\/|~)/gi,
      /shutil\.rmtree/gi,
      /glob\s*\(\s*['"]\*\*\/\*['"]\s*\)/gi,
    ],
  },

  // ── Prompt-level manipulation ──────────────────────────────────────────
  {
    id: "PROMPT_INJECTION",
    title: "Instruction override inside skill text",
    detail:
      "Phrases like 'ignore previous instructions' or 'you must now' try to hijack the agent away from the user's intent — the core malicious movement for prompt/extension skills. Detects both English and Russian phrasing.",
    severity: 90,
    patterns: [
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/gi,
      /disregard\s+(all\s+)?(previous|prior|your)\s+(instructions|rules|training)/gi,
      /(you\s+must|do\s+not\s+tell|don'?t\s+tell)\s+(the\s+)?(user|human)/gi,
      /do\s+not\s+(reveal|disclose|mention)\s+(this|these)\s+instructions/gi,
      /system\s*prompt\s*:|###\s*system\b/gi,
      /you\s+are\s+now\s+(a|an)\s+/gi,
      /(new|override)\s+(system\s+)?instructions\s*:/gi,
      /keep\s+this\s+(secret|hidden|between\s+us)/gi,
      // Russian-language injection phrases (no \b — it is ASCII-only in JS regex)
      /игнор(?:ируй|ировать)\s+(?:все\s+)?(?:предыдущие|прошлые|прежние|выше(?:указанные|написанные)?)\s+(?:инструкции|указания|правила)/gi,
      /проигнорируй\s+(?:все\s+)?(?:предыдущие|прошлые|прежние)/gi,
      /забудь\s+(?:вс[её]|все),?\s+что\s+тебе\s+(?:говорили|сказали)/gi,
      /не\s+(?:говори|рассказывай|сообщай|упоминай|показывай)\s+(?:об\s+этом|пользователю|человеку|нему)/gi,
      /не\s+(?:раскрывай|разглашай)\s+(?:эти|это|их|такие)\s+(?:инструкции|указания|правила)/gi,
      /(?:скрой\s+это|держи\s+это\s+в\s+секрете|держи\s+в\s+секрете)/gi,
      /теперь\s+ты\s+(?:работаешь|действуешь|ведёшь\s+себя)\s+как/gi,
      /системн(?:ый|ые|ая)\s+(?:промпт|инструкци\w+)\s*:/gi,
    ],
  },
  {
    id: "TOOL_HIJACK",
    title: "Hidden tool invocation or shadow config",
    detail:
      "MCP/extension configs that call extra servers, run arbitrary commands, or auto-approve can expose tools the user never agreed to.",
    severity: 80,
    patterns: [
      // tolerate both YAML (command:) and JSON ("command":) key styles
      /["']?mcpServers["']?[\s\S]{0,200}["']?command["']?\s*:/gi,
      /["']?allowedTools["']?\s*:\s*\[\s*['"]\*["']?/gi,
      /"(alwaysAllow|autoApprove|dangerouslySkipPermissions)"\s*:\s*true/gi,
      /--allow-all|--yolo|--dangerously/gi,
      /npx\b[^;&]*\b(sh|bash|curl|node\s+-e)\b/gi,
    ],
  },
  {
    id: "SILENT_INSTALL",
    title: "Installs software without asking",
    detail:
      "Silent package installs (pip/npm/curl-to-shell) can pull in compromised dependencies or a reverse shell at first run.",
    severity: 65,
    patterns: [
      /\b(pip3?|npm|i?nx|bun|yarn)\s+(install|add|i)\b[^|;&]*(&&|;|\|)/gi,
      /curl[^|;&]*\|\s*(ba)?sh\b/gi,
      /wget[^|;&]*\|\s*(ba)?sh\b/gi,
      /apt(-get)?\s+install\s+(-y\s+)/gi,
    ],
  },

  // ── NVIDIA ecosystem ─────────────────────────────────────────────────
  {
    id: "NVIDIA_CREDENTIAL_HARVEST",
    title: "Harvests NVIDIA credentials",
    detail:
      "Reads nvapi-* keys, NGC API keys, or NVIDIA_TOKEN from env/files. A stolen NVIDIA key works across every NIM model and NGC container registry — one leak, full account access.",
    severity: 80,
    patterns: [
      /nvapi-[A-Za-z0-9_-]{20,}/g,
      /NVIDIA(?:_API)?_KEY\b|NVIDIA_TOKEN\b|NGC_API_KEY\b/gi,
      /nvidia\.com\/api\b|ngc\.nvidia\.com/gi,
    ],
  },
  {
    id: "NVIDIA_SHADOW_NIM",
    title: "Calls NVIDIA NIM endpoints outside declared config",
    detail:
      "Direct network calls to NIM (integrate.api.nvidia.com) or NGC let a skill swap its declared model for an attacker-controlled one, or run undisclosed inference on your key. Endpoint mentions in prose are fine — direct HTTP/docker calls are the shadow route.",
    severity: 70,
    patterns: [
      // Same-line network-verb + endpoint: a fetch/curl/requests call that reaches a NIM host.
      // Bare endpoint mentions (docs, declared base URLs) stay clean to avoid flagging every legit NIM client.
      /^[^\n]*(?:\bfetch|\bcurl|\bwget|\baxios|\bhttpx\b|requests\.(?:post|get)|urllib|http\.client)[^\n]*integrate\.api\.nvidia\.com/gim,
      /^[^\n]*(?:\bfetch|\bcurl|\bwget|\baxios|\bhttpx\b|requests\.(?:post|get)|urllib|http\.client)[^\n]*(?:api\.nvidia\.com|nim\.nvidia\.com|build\.nvidia\.com)/gim,
      /nvcr\.io[^\n]{0,120}(?:\brun\b|\bpull\b|docker\s+run)/gi,
      /docker\s+run[^\n]{0,120}nvcr\.io/gi,
      /\bngc\b[^\n]{0,80}(?:registry|pull|\brun\b)/gi,
    ],
  },

  // ── Persistence ────────────────────────────────────────────────────────
  {
    id: "PERSISTENCE",
    title: "Tries to survive restarts",
    detail:
      "Writing cron jobs, shell profiles, launch agents, or autostart entries means the skill wants to keep running after the session ends.",
    severity: 80,
    patterns: [
      /crontab\b/gi,
      /\/etc\/(cron|systemd|launchd)/gi,
      /~\/\.(bashrc|zshrc|profile|bash_profile)/gi,
      /LaunchAgents|autostart/gi,
      /registry\s+run|RunOnce|CurrentVersion\\Run/gi,
      // Russian technical terms
      /автозагрузк|автозапуск|планировщик\s+задач|автостарт/gi,
    ],
  },

  // ── Escalation ─────────────────────────────────────────────────────────
  {
    id: "PRIVILEGE_ESCALATION",
    title: "Requests elevated privileges",
    detail:
      "sudo, uid spoofing, or container escapes give a skill power far beyond what a helper needs.",
    severity: 85,
    patterns: [
      /\bsudo\b/gi,
      /chmod\s+[u+]\+s/gi,
      /\bnsenter\b|\bunshare\b|\bcapsh\b/gi,
      /\/etc\/(passwd|shadow)\b/gi,
      /setuid|setgid\b/gi,
    ],
  },
];

/** Only flag encoded blobs when the text otherwise looks like config/code;
 *  prose in a description rarely warrants the ENCODED_SECRETS heuristic. */
function looksLikeConfigOrCode(text: string): boolean {
  return (
    /\{|\}|=>|;\n|^\s*(import|export|const|function|def)\b/m.test(text) ||
    /(https?:\/\/|\/[a-z-]+\/[a-z-]+)/i.test(text)
  );
}

export function analyzeSkill(input: SkillInput, config: RiskConfig = DEFAULT_RISK_CONFIG): SkillAnalysis {
  const haystack = `${input.name}\n${input.description ?? ""}\n${input.body}`;
  const findings: Finding[] = [];

  for (const rule of RULES) {
    const severity = config.severityOverrides[rule.id] ?? rule.severity;
    const evidence: string[] = [];
    const seen = new Set<string>();
    for (const pattern of rule.patterns) {
      const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
      let match: RegExpExecArray | null;
      while ((match = re.exec(haystack)) !== null) {
        const snippet = match[0].trim().slice(0, 160);
        if (snippet && !seen.has(snippet)) {
          seen.add(snippet);
          evidence.push(snippet);
        }
        if (match.index === re.lastIndex) re.lastIndex++; // guard zero-length matches
        if (evidence.length >= 4) break;
      }
      if (evidence.length >= 4) break;
    }
    if (evidence.length === 0) continue;

    if (rule.id === "ENCODED_SECRETS" && !looksLikeConfigOrCode(haystack)) {
      continue;
    }
    // A severity override of 0 (or below) disables the rule entirely.
    if (severity <= 0) {
      continue;
    }

    findings.push({
      ruleId: rule.id,
      title: rule.title,
      detail: rule.detail,
      severity,
      evidence,
    });
  }

  findings.sort((a, b) => b.severity - a.severity);

  const maxSeverity = findings.length > 0 ? findings[0].severity : 0;
  const distinctRules = new Set(findings.map((f) => f.ruleId)).size;
  const stackBonus = Math.min(
    Math.max(0, distinctRules - 1) * config.stackBonusPerExtraRule,
    config.maxStackBonus,
  );
  const riskScore = Math.min(maxSeverity + stackBonus, config.scoreCap);

  return {
    riskScore,
    riskLevel: toRiskLevel(riskScore, config),
    findings,
  };
}
