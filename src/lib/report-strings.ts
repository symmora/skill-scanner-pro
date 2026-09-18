/**
 * Localized strings for the Markdown report generator.
 * Kept separate from the main i18n dictionary so the report module
 * doesn't depend on React context.
 */

import type { Language } from "./i18n";

export interface ReportStrings {
  title: string;
  score: string;
  type: string;
  description: string;
  analyzedAt: string;
  findings: string;
  findingsSection: string;
  ruleCol: string;
  severityCol: string;
  evidence: string;
  noFindings: string;
  disclaimer: string;
  kindTool: string;
  kindMcp: string;
  kindPrompt: string;
  kindExtension: string;
  levelNone: string;
  levelLow: string;
  levelMedium: string;
  levelHigh: string;
  levelCritical: string;
}

export const REPORT_STRINGS: Record<Language, ReportStrings> = {
  en: {
    title: "Risk report",
    score: "Score",
    type: "Type",
    description: "Description",
    analyzedAt: "Analyzed",
    findings: "Findings count",
    findingsSection: "Findings",
    ruleCol: "Rule",
    severityCol: "Severity",
    evidence: "Evidence",
    noFindings: "No manipulation patterns were detected — all rules came back clean.",
    disclaimer:
      "Static analysis only — findings are signals, not verdicts. Always review by hand before running a skill.",
    kindTool: "Tool",
    kindMcp: "MCP",
    kindPrompt: "Prompt pack",
    kindExtension: "Extension",
    levelNone: "Clean",
    levelLow: "Low",
    levelMedium: "Medium",
    levelHigh: "High",
    levelCritical: "Critical",
  },
  ru: {
    title: "Отчёт о рисках",
    score: "Оценка",
    type: "Тип",
    description: "Описание",
    analyzedAt: "Проанализировано",
    findings: "Кол-во находок",
    findingsSection: "Находки",
    ruleCol: "Правило",
    severityCol: "Вес",
    evidence: "Доказательства",
    noFindings: "Манипулятивные паттерны не обнаружены — все правила пройдены чисто.",
    disclaimer:
      "Только статический анализ — находки это сигналы, а не приговоры. Всегда проверяйте навык вручную перед запуском.",
    kindTool: "Инструмент",
    kindMcp: "MCP",
    kindPrompt: "Набор промптов",
    kindExtension: "Расширение",
    levelNone: "Чисто",
    levelLow: "Низкий",
    levelMedium: "Средний",
    levelHigh: "Высокий",
    levelCritical: "Критический",
  },
  es: {
    title: "Informe de riesgos",
    score: "Puntuación",
    type: "Tipo",
    description: "Descripción",
    analyzedAt: "Analizado",
    findings: "N.º de hallazgos",
    findingsSection: "Hallazgos",
    ruleCol: "Regla",
    severityCol: "Gravedad",
    evidence: "Evidencia",
    noFindings: "No se detectaron patrones de manipulación — todas las reglas pasaron limpias.",
    disclaimer:
      "Solo análisis estático — los hallazgos son señales, no veredictos. Revisa siempre a mano antes de ejecutar un skill.",
    kindTool: "Herramienta",
    kindMcp: "MCP",
    kindPrompt: "Paquete de prompts",
    kindExtension: "Extensión",
    levelNone: "Limpio",
    levelLow: "Bajo",
    levelMedium: "Medio",
    levelHigh: "Alto",
    levelCritical: "Crítico",
  },
};
