import type { Doc } from "@/convex/_generated/dataModel";
import { getRuleMeta } from "@/lib/rule-catalog";

type Skill = Doc<"scannedSkills">;
type Language = "en" | "ru";

const LEVELS: Record<Language, Record<string, string>> = {
  en: {
    none: "Clean",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  },
  ru: {
    none: "Чисто",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический",
  },
};

const RECOMMENDATIONS: Record<Language, Record<string, string>> = {
  en: {
    none: "Can be used",
    low: "Can be used; findings archived for reference",
    medium: "Use with restrictions (sandbox, no secrets, no network)",
    high: "Reject or apply strict restrictions",
    critical: "Reject",
  },
  ru: {
    none: "Можно использовать",
    low: "Можно использовать; находки зафиксированы",
    medium: "Использовать с ограничениями (песочница, без секретов, без сети)",
    high: "Отклонить либо жёсткие ограничения",
    critical: "Отклонить",
  },
};

const METHOD_URL = "https://github.com/symmora/skill-scanner-pro/blob/main/docs/skill-assessment-protocol.md";

/**
 * Builds the assessment protocol (Markdown) for a scanned skill.
 * The final score is placed first — it is the headline of the document.
 */
export function buildAssessmentProtocol(skill: Skill, language: Language): string {
  const ru = language === "ru";
  const level = LEVELS[language][skill.riskLevel] ?? skill.riskLevel;
  const recommendation = RECOMMENDATIONS[language][skill.riskLevel] ?? "";
  const date = new Date(skill.analyzedAt).toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const lines: string[] = [];

  // ── Headline: the final score first ──────────────────────────────────
  lines.push(`# ${ru ? "Протокол оценки навыка" : "Skill assessment protocol"}`);
  lines.push("");
  lines.push(`## ${ru ? "Итоговый скор" : "Final score"}: ${skill.riskScore} / 100 — ${level}`);
  lines.push("");
  lines.push(`${ru ? "Рекомендация" : "Recommendation"}: **${recommendation}**`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Passport ─────────────────────────────────────────────────────────
  lines.push(ru ? "## Паспорт" : "## Passport");
  lines.push("");
  lines.push(`- ${ru ? "Название" : "Name"}: ${skill.name}`);
  lines.push(`- ${ru ? "Тип" : "Kind"}: ${skill.kind}`);
  if (skill.description) {
    lines.push(`- ${ru ? "Описание" : "Description"}: ${skill.description}`);
  }
  lines.push(`- ${ru ? "Дата оценки" : "Assessed at"}: ${date}`);
  lines.push(`- ${ru ? "Методика" : "Method"}: ${ru ? "Скилл-сканер v1" : "Skill-scanner v1"} (${METHOD_URL})`);
  lines.push("");

  // ── Scanner result ───────────────────────────────────────────────────
  lines.push(ru ? "## Результат сканера" : "## Scanner result");
  lines.push("");

  // ── Score breakdown: several scores, so the final number is never a black box ──
  const sorted = [...skill.findings].sort((a, b) => b.severity - a.severity);
  const maxWeight = sorted[0]?.severity ?? 0;
  const maxRule = sorted[0]?.ruleId ?? "—";
  const extraRules = Math.max(0, skill.findings.length - 1);
  const bonus = Math.min(24, extraRules * 6);
  const byFormula = Math.min(100, maxWeight + bonus);

  lines.push(ru ? "### Разброс оценки" : "### Score breakdown");
  lines.push("");
  if (skill.findings.length === 0) {
    lines.push(
      ru
        ? "- Сработавших правил нет → итоговый скор: **0**"
        : "- No rules triggered → final score: **0**",
    );
  } else {
    lines.push(
      ru
        ? `- Максимальный вес правила: **${maxWeight}** (\`${maxRule}\`)`
        : `- Max rule weight: **${maxWeight}** (\`${maxRule}\`)`,
    );
    lines.push(
      ru
        ? `- Сработавших правил: **${skill.findings.length}** → стекинг-бонус: **+${bonus}** (6 × ${extraRules}, потолок 24)`
        : `- Triggered rules: **${skill.findings.length}** → stacking bonus: **+${bonus}** (6 × ${extraRules}, cap 24)`,
    );
    lines.push(`- ${ru ? "Кап оценки" : "Score cap"}: 100`);
    lines.push(
      ru
        ? `- По формуле: ${maxWeight} + ${bonus} = **${byFormula}**${byFormula === skill.riskScore ? "" : " (фактический скор отличается — деплой использует свою калибровку)"}`
        : `- By formula: ${maxWeight} + ${bonus} = **${byFormula}**${byFormula === skill.riskScore ? "" : " (actual score differs — deployment uses its own calibration)"}`,
    );
  }
  lines.push("");
  lines.push(`| # | ${ru ? "Правило" : "Rule"} | ID | ${ru ? "Вес" : "Weight"} | ${ru ? "Цитаты" : "Evidence"} |`);
  lines.push("|---|---|---|---|---|");
  skill.findings.forEach((f, i) => {
    const meta = getRuleMeta(f.ruleId);
    const title = meta ? meta.title[language] : f.ruleId;
    const evidence = f.evidence.length > 0 ? f.evidence.map((e) => `\`${e.replace(/`/g, "'")}\``).join("<br>") : "—";
    lines.push(`| ${i + 1} | ${title} | \`${f.ruleId}\` | ${f.severity} | ${evidence} |`);
  });
  lines.push("");

  // ── Verdict ──────────────────────────────────────────────────────────
  lines.push(ru ? "## Вердикт" : "## Verdict");
  lines.push("");
  lines.push(
    ru
      ? `- Уровень: **${level}** (${skill.riskScore} / 100)`
      : `- Level: **${level}** (${skill.riskScore} / 100)`,
  );
  lines.push(`- ${ru ? "Уверенность" : "Confidence"}: ${ru ? "средняя (статический анализ)" : "medium (static analysis)"}`);
  lines.push(`- ${ru ? "Рекомендация" : "Recommendation"}: **${recommendation}**`);
  lines.push("");
  lines.push(
    ru
      ? "> Находки — сигналы, а не приговор. Итоговое решение за человеком: проверьте цитаты вручную."
      : "> Findings are signals, not verdicts. The final call is human: review the quoted evidence.",
  );
  lines.push("");
  lines.push(`---`);
  lines.push(
    ru
      ? `*Сгенерировано «Скилл-сканером» v1 · ${date} · хэш методики 1.0*`
      : `*Generated by Skill-scanner v1 · ${date} · methodology 1.0*`,
  );

  return lines.join("\n");
}

/** Downloads the protocol as a .md file. */
export function downloadAssessmentProtocol(skill: Skill, language: Language): void {
  const md = buildAssessmentProtocol(skill, language);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `protocol-${skill.name.replace(/[^a-zA-Z0-9_-]+/g, "_")}-${skill.riskScore}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
