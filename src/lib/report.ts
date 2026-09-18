/**
 * Markdown report generator for a scanned skill.
 *
 * Runs fully on the client: rule titles/details come from the rule catalog
 * (so the report is localized), evidence quotes stay verbatim because they
 * are the original source text of the skill.
 */

import type { Doc } from "@/convex/_generated/dataModel";
import { getRuleMeta } from "./rule-catalog";
import type { Language } from "./i18n";
import { REPORT_STRINGS } from "./report-strings";

type RiskLevel =
  | "none"
  | "low"
  | "medium"
  | "elevated"
  | "high"
  | "critical";
type SkillKind = "skill" | "mcp" | "hook" | "subagent";

type ScannedSkill = Omit<Doc<"scannedSkills">, "userId">;

export function skillToMarkdown(skill: ScannedSkill, language: Language): string {
  const s = REPORT_STRINGS[language];
  const meta = getRuleMeta;

  const kindLabels: Record<SkillKind, string> = {
    skill: s.kindSkill,
    mcp: s.kindMcp,
    hook: s.kindHook,
    subagent: s.kindSubagent,
  };
  const levelLabels: Record<RiskLevel, string> = {
    none: s.levelNone,
    low: s.levelLow,
    medium: s.levelMedium,
    elevated: s.levelElevated,
    high: s.levelHigh,
    critical: s.levelCritical,
  };

  const locale =
    language === "ru" ? "ru-RU" : language === "es" ? "es-ES" : "en-US";
  const analyzed = new Date(skill.analyzedAt).toLocaleString(locale, {
    dateStyle: "long",
    timeStyle: "short",
  });

  const lines: string[] = [];

  lines.push(`# ${s.title}: ${skill.name}`);
  lines.push("");
  lines.push(`- **${s.score}:** ${skill.riskScore}/100 (${levelLabels[skill.riskLevel as RiskLevel]})`);
  lines.push(`- **${s.type}:** ${kindLabels[skill.kind as SkillKind]}`);
  if (skill.description) {
    lines.push(`- **${s.description}:** ${skill.description}`);
  }
  lines.push(`- **${s.analyzedAt}:** ${analyzed}`);
  lines.push(`- **${s.findings}:** ${skill.findings.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  if (skill.findings.length === 0) {
    lines.push(`> ✅ ${s.noFindings}`);
    lines.push("");
    return lines.join("\n");
  }

  lines.push(`## ${s.findingsSection}`);
  lines.push("");
  lines.push(`| # | ${s.ruleCol} | ${s.severityCol} |`);
  lines.push(`|---|------|----------|`);
  skill.findings.forEach((f, i) => {
    lines.push(`| ${i + 1} | ${meta(f.ruleId).title[language]} | ${f.severity} |`);
  });
  lines.push("");

  skill.findings.forEach((f, i) => {
    const ruleMeta = meta(f.ruleId);
    lines.push(`### ${i + 1}. ${ruleMeta.title[language]}`);
    lines.push("");
    lines.push(`\`${f.ruleId}\` · ${s.severityCol}: **${f.severity}**`);
    lines.push("");
    lines.push(ruleMeta.detail[language]);
    lines.push("");
    if (f.evidence.length > 0) {
      lines.push(`**${s.evidence}:**`);
      lines.push("");
      for (const e of f.evidence) {
        lines.push("```");
        lines.push(e);
        lines.push("```");
      }
      lines.push("");
    }
  });

  lines.push("---");
  lines.push("");
  lines.push(`> ${s.disclaimer}`);
  lines.push("");

  return lines.join("\n");
}

/** Trigger a browser download of the report without any extra deps. */
export function downloadMarkdownReport(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".md") ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Safe filename: skill name → slug, e.g. "deploy-helper.md" */
export function reportFileName(skillName: string): string {
  const slug = skillName
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "skill"}-report.md`;
}
