/**
 * Human-voiced verdict messages per risk level.
 *
 * Variants are PAIRED across languages: VERDICTS.en[level][i] is the
 * translation of VERDICTS.ru[level][i]. getVerdictMessage() picks a variant
 * by seed, so the same skill shows the same message index in both languages
 * and the downloaded protocol stays stable across re-downloads.
 */

type Lang = "en" | "ru" | "es";

export type VerdictLevel = "none" | "low" | "medium" | "high" | "critical";

const VERDICTS: Record<Lang, Record<VerdictLevel, string[]>> = {
  en: {
    none: [
      "Excellent skill. Take good care of it.",
      "Squeaky clean. This one earns its place.",
      "Nothing to worry about. Ship it.",
      "A rare sight: a skill with nothing to hide.",
      "This one passed with flying colors.",
    ],
    low: [
      "Looks safe, just keep an eye on it.",
      "Minor quirks, nothing hostile. Fine to use.",
      "Low risk. Worth a quick skim of the findings.",
      "Nothing scary here. Stay curious, not worried.",
      "Clean enough. Note the findings and move on.",
    ],
    medium: [
      "Usable, but with restrictions. Read the findings first.",
      "Some sharp edges. Sandbox it, don't trust it blindly.",
      "Think twice before letting this near your secrets.",
      "Not malicious, but demanding. Set boundaries first.",
      "Allowed with supervision. Check what it touches.",
    ],
    high: [
      "Don't install this. It's not safe.",
      "Too many red flags. Keep it out of your agent.",
      "This one asks for too much. Say no.",
      "Borderline hostile. Better declined than sorry.",
      "Your agent will thank you for skipping this one.",
    ],
    critical: [
      "Don't touch it. It's not safe.",
      "Do not touch it. It is not safe.",
      "This is an attack, not a skill. Walk away.",
      "Handle with nothing. Delete and forget.",
      "Red alert: confirmed malicious patterns inside.",
    ],
  },
  ru: {
    none: [
      "Отличный скилл. Береги его.",
      "Кристально чисто. Такой место в вашей коллекции.",
      "Здесь не о чем переживать. Ставь и работай.",
      "Редкая вещь: навык, которому нечего скрывать.",
      "Прошёл проверку на отлично.",
    ],
    low: [
      "Выглядит безопасно, но держи ухо востро.",
      "Мелкие странности, враждебности нет. Можно использовать.",
      "Низкий риск. Стоит пробежаться по находкам.",
      "Ничего страшного. Интересуйтесь, но не тревожьтесь.",
      "Достаточно чистый. Зафиксируйте находки и живите дальше.",
    ],
    medium: [
      "Использовать можно, но с ограничениями. Сначала прочти находки.",
      "Есть острые края. В песочницу — и не доверять слепо.",
      "Подумай дважды, прежде чем пускать его к секретам.",
      "Не злодей, но требовательный. Сначала границы, потом запуск.",
      "Допустим под присмотром. Проверяй, к чему прикасается.",
    ],
    high: [
      "Не устанавливай это. Оно небезопасно.",
      "Слишком много красных флагов. Не пускай это к агенту.",
      "Этот просит слишком многого. Скажи нет.",
      "На грани враждебности. Лучше отказать, чем пожалеть.",
      "Агент скажет тебе спасибо, если ты это пропустишь.",
    ],
    critical: [
      "Не трогай его больше. Он не безопасен.",
      "Не прикасайся к нему. Это небезопасно.",
      "Это атака, а не навык. Обойди стороной.",
      "Обращаться с этим не нужно вообще. Удалить и забыть.",
      "Красный код: внутри подтверждённые вредоносные паттерны.",    ],
  },
  es: {
    none: [
      "Skill excelente. Cuídalo bien.",
      "Limpio como el cristal. Se ganó su lugar.",
      "Nada de qué preocuparse. Úsalo sin miedo.",
      "Una rareza: un skill que no esconde nada.",
      "Pasó la revisión con matrícula de honor.",
    ],
    low: [
      "Se ve seguro, solo mantén el ojo abierto.",
      "Pequeñas rarezas, nada hostil. Se puede usar.",
      "Riesgo bajo. Vale la pena ojear los hallazgos.",
      "Nada de miedo. Curiosidad sí, preocupación no.",
      "Suficientemente limpio. Anota los hallazgos y sigue.",
    ],
    medium: [
      "Se puede usar, pero con restricciones. Lee los hallazgos primero.",
      "Tiene bordes afilados. Sandboxed y sin confiar a ciegas.",
      "Piénsalo dos veces antes de dejarlo cerca de tus secretos.",
      "No es malicioso, pero es exigente. Pon límites primero.",
      "Permitido bajo supervisión. Revisa qué toca.",
    ],
    high: [
      "No lo instales. No es seguro.",
      "Demasiadas banderas rojas. Mantenlo lejos de tu agente.",
      "Este pide demasiado. Di que no.",
      "Al borde de la hostilidad. Mejor rechazar que lamentar.",
      "Tu agente te lo agradecerá si lo saltas.",
    ],
    critical: [
      "No lo toques más. No es seguro.",
      "No lo toques. No es seguro.",
      "Esto es un ataque, no un skill. Aléjate.",
      "No hay forma segura de manejarlo. Bórralo y olvídalo.",
      "Código rojo: patrones maliciosos confirmados dentro.",
    ],
  },
};

/** Deterministic 0..n-1 pick from an arbitrary string seed. */
function pickVariant(seed: string, count: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

/** Human-voiced verdict for a risk level. Stable for a given skill name. */
export function getVerdictMessage(
  level: VerdictLevel,
  language: Lang,
  skillName: string,
): string {
  const variants = VERDICTS[language][level];
  return variants[pickVariant(skillName, variants.length)];
}

/** Index of the chosen variant (to keep EN/RU paired in the protocol). */
export function getVerdictIndex(level: VerdictLevel, skillName: string): number {
  return pickVariant(skillName, VERDICTS.en[level].length);
}
