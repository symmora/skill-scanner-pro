import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGUAGE_STORAGE_KEY } from "./language-constants";

export type Language = "en" | "ru";

export const LANGUAGES: { id: Language; label: string; short: string }[] = [
  { id: "en", label: "English", short: "EN" },
  { id: "ru", label: "Русский", short: "RU" },
];

const en = {
  appName: "Skill-scanner",
  // Nav / header
  signIn: "Sign in",
  startScanning: "Start scanning",
  scannedFlagged: (skills: number, flagged: number) =>
    `${skills} scanned · ${flagged} flagged`,
  signOut: "Sign out",

  // Landing
  badge: "Static risk analysis for agent skills",
  heroTitle1: "Every skill your agent runs",
  heroTitle2: "should earn your trust first.",
  heroSubtitle:
    "Skills and MCP tools can hide malicious movements — obfuscated commands, instruction hijacks, quiet exfiltration. Skill-scanner reads the definition before your agent ever does, and scores it 0–100.",
  ctaFirst: "Scan your first skill",
  ctaHow: "See how it works",
  heroNote: "Free · runs locally on Convex · no skill ever leaves your workspace",
  mockTitle: "Scan results",
  mockCount: (n: number) => `${n} skills analyzed`,
  howTitle: "Three steps, no agent required",
  howSubtitle:
    "The scanner reads text, not behavior. Nothing executes — the riskiest skill in the world can't hurt you here.",
  rulesTitle: "Built for the movements that matter",
  rulesSubtitle:
    "Version 1 focuses on one job: reading a list of skills and telling you which ones to keep.",
  ctaTitle: "Read the skill before it reads you.",
  ctaSubtitle:
    "Paste a skill, get a score, decide with evidence. That's the whole product — and that's the point.",
  ctaButton: "Start scanning — it's free",
  footerNote:
    "Static analysis only — findings are signals, not verdicts. Always review by hand.",

  // Landing steps
  step1Title: "Paste a skill",
  step1Detail:
    "Drop in a tool definition, MCP config, prompt pack, or extension manifest — any text that reaches your agent.",
  step2Title: "Run the scan",
  step2Detail:
    "Skill-scanner applies a ruleset built for agent abuse patterns: obfuscation, injection, exfil, persistence, escalation.",
  step3Title: "Read the verdict",
  step3Detail:
    "A 0–100 risk score with cited evidence — every finding quotes the exact line that triggered it.",

  // Risk levels
  riskLabels: {
    none: "Clean",
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  },
  clean: "Clean",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",

  // Landing mock names
  findings: (n: number) => `${n} finding${n > 1 ? "s" : ""}`,
  findingsRu: (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} находка`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} находки`;
    return `${n} находок`;
  },

  // Dashboard
  dashboardTitle: "Risk score list",
  dashboardSubtitle:
    "Skills you scan are analyzed for malicious movements and hidden tooling, then ranked by risk.",
  statsScanned: "Skills scanned",
  statsFlagged: "High / critical",
  statsClean: "Clean",
  statsTop: "Highest score",
  scanSkill: "Scan a skill",
  scanNote: "Nothing executes — text analysis only.",
  fieldName: "Name",
  fieldType: "Type",
  fieldDesc: "Description",
  fieldDescOptional: "(optional)",
  descPlaceholder: "What it claims to do",
  fieldBody: "Manifest / definition",
  bodyPlaceholder: "Paste the tool definition, MCP config, prompt text, or manifest here…",
  runScan: "Run scan",
  scanning: "Scanning…",
  resultsTitle: "Scan results",
  loadingResults: "loading…",
  shown: (n: number) => `${n} shown`,
  filterAll: "All",
  filterFlagged: "High risk",
  filterClean: "Clean",
  loadingScans: "Loading your scans…",
  emptyAllTitle: "No skills scanned yet",
  emptyAllDetail:
    "Paste your first tool, MCP config, or prompt pack on the left and run a scan.",
  emptyFilteredTitle: "Nothing matches this filter",
  emptyFilteredDetail: "Try a different filter, or scan another skill.",
  noFindings:
    "No manipulation patterns detected — every rule came back clean.",
  severity: "sev",
  removeFromList: "Remove from list",
  exportReport: "Export report",
  showFindings: "Show findings",
  hideFindings: "Hide findings",

  // Kinds
  kindTool: "Tool",
  kindMcp: "MCP",
  kindPrompt: "Prompt pack",
  kindExtension: "Extension",

  // Toasts
  toastScanned: (name: string, score: number, level: string) =>
    `Scanned "${name}" — risk ${score}/100 (${level})`,
  toastScanFailed: "Scan failed. Check the content and try again.",
  toastRemoved: "Removed from your list",
  toastRemoveFailed: "Could not remove skill",

  // Auth
  authTitle: "Get Started",
  authSubtitle: "Enter your email to log in or sign up",
  emailPlaceholder: "name@example.com",
  or: "Or",
  continueGuest: "Continue as Guest",
  checkEmail: "Check your email",
  codeSent: (email: string) => `We've sent a code to ${email}`,
  noCode: "Didn't receive a code?",
  tryAgain: "Try again",
  useDifferentEmail: "Use different email",
  verifyCode: "Verify code",
  verifying: "Verifying…",
  wrongCode: "The verification code you entered is incorrect.",
  sendFailed: "Failed to send verification code. Please try again.",
  guestFailed: (msg: string) => `Failed to sign in as guest: ${msg}`,
  unknownError: "Unknown error",
  securedBy: "Secured by",

  // Loading
  routeLoading: "Loading...",
  back: "Back",

  // Language switcher
  language: "Language",
};

type Dict = typeof en;

const ru: Dict = {
  appName: "Скилл-сканер",
  signIn: "Войти",
  startScanning: "Начать сканирование",
  scannedFlagged: (skills: number, flagged: number) =>
    `${skills} просканировано · ${flagged} с риском`,
  signOut: "Выйти",

  badge: "Статический анализ рисков навыков агента",
  heroTitle1: "Каждый навык, который запускает ваш агент,",
  heroTitle2: "сначала должен заслужить доверие.",
  heroSubtitle:
    "Навыки и MCP-инструменты могут скрывать вредоносные действия — обфусцированные команды, перехват инструкций, тихую эксфильтрацию. Скилл-сканер читает определение раньше вашего агента и выставляет оценку 0–100.",
  ctaFirst: "Просканировать первый навык",
  ctaHow: "Как это работает",
  heroNote: "Бесплатно · работает локально на Convex · навык не покидает ваш воркспейс",
  mockTitle: "Результаты сканирования",
  mockCount: (n: number) => `просканировано навыков: ${n}`,
  howTitle: "Три шага, без запуска агента",
  howSubtitle:
    "Сканер читает текст, а не поведение. Ничего не выполняется — даже самый опасный навык не может вам навредить здесь.",
  rulesTitle: "Создан для действий, которые действительно опасны",
  rulesSubtitle:
    "Версия 1 делает одну работу: читает список навыков и говорит, какие стоит оставить.",
  ctaTitle: "Прочитайте навык, прежде чем он прочитает вас.",
  ctaSubtitle:
    "Вставьте навык, получите оценку, решите на основе доказательств. Это весь продукт — в этом и суть.",
  ctaButton: "Начать сканирование — это бесплатно",
  footerNote:
    "Только статический анализ — находки это сигналы, а не приговоры. Всегда проверяйте вручную.",

  step1Title: "Вставьте навык",
  step1Detail:
    "Определение инструмента, MCP-конфиг, набор промптов или манифест расширения — любой текст, который попадает к вашему агенту.",
  step2Title: "Запустите сканирование",
  step2Detail:
    "Скилл-сканер применяет набор правил для паттернов злоупотребления агентами: обфускация, инъекции, эксфильтрация, закрепление, эскалация.",
  step3Title: "Прочитайте вердикт",
  step3Detail:
    "Оценка риска 0–100 с доказательствами — каждая находка цитирует конкретную строку, которая её вызвала.",

  riskLabels: {
    none: "Чисто",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    critical: "Критический",
  },
  clean: "Чисто",
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
  critical: "Критический",

  findings: (n: number) => `${n} finding${n > 1 ? "s" : ""}`,
  findingsRu: (n: number) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} находка`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} находки`;
    return `${n} находок`;
  },

  dashboardTitle: "Список оценок риска",
  dashboardSubtitle:
    "Просканированные навыки анализируются на вредоносные действия и скрытые инструменты, затем ранжируются по риску.",
  statsScanned: "Просканировано",
  statsFlagged: "Высокий / критический",
  statsClean: "Чисто",
  statsTop: "Максимальная оценка",
  scanSkill: "Сканировать навык",
  scanNote: "Ничего не выполняется — только анализ текста.",
  fieldName: "Название",
  fieldType: "Тип",
  fieldDesc: "Описание",
  fieldDescOptional: "(необязательно)",
  descPlaceholder: "Что он должен делать",
  fieldBody: "Манифест / определение",
  bodyPlaceholder: "Вставьте определение инструмента, MCP-конфиг, текст промпта или манифест…",
  runScan: "Запустить сканирование",
  scanning: "Сканирование…",
  resultsTitle: "Результаты сканирования",
  loadingResults: "загрузка…",
  shown: (n: number) => `показано: ${n}`,
  filterAll: "Все",
  filterFlagged: "Высокий риск",
  filterClean: "Чистые",
  loadingScans: "Загружаем ваши сканы…",
  emptyAllTitle: "Навыки ещё не просканированы",
  emptyAllDetail:
    "Вставьте первый инструмент, MCP-конфиг или набор промптов слева и запустите сканирование.",
  emptyFilteredTitle: "Под этот фильтр ничего не подошло",
  emptyFilteredDetail: "Попробуйте другой фильтр или просканируйте ещё один навык.",
  noFindings: "Манипулятивные паттерны не обнаружены — все правила пройдены чисто.",
  severity: "вес",
  removeFromList: "Убрать из списка",
  exportReport: "Экспорт отчёта",
  showFindings: "Показать находки",
  hideFindings: "Скрыть находки",

  kindTool: "Инструмент",
  kindMcp: "MCP",
  kindPrompt: "Набор промптов",
  kindExtension: "Расширение",

  toastScanned: (name: string, score: number, level: string) =>
    `Просканировано «${name}» — риск ${score}/100 (${level})`,
  toastScanFailed: "Сканирование не удалось. Проверьте содержимое и попробуйте снова.",
  toastRemoved: "Убрано из списка",
  toastRemoveFailed: "Не удалось убрать навык",

  authTitle: "Начать",
  authSubtitle: "Введите email для входа или регистрации",
  emailPlaceholder: "name@example.com",
  or: "Или",
  continueGuest: "Продолжить как гость",
  checkEmail: "Проверьте почту",
  codeSent: (email: string) => `Мы отправили код на ${email}`,
  noCode: "Не получили код?",
  tryAgain: "Попробовать снова",
  useDifferentEmail: "Использовать другой email",
  verifyCode: "Подтвердить код",
  verifying: "Проверяем…",
  wrongCode: "Введённый код подтверждения неверен.",
  sendFailed: "Не удалось отправить код подтверждения. Попробуйте ещё раз.",
  guestFailed: (msg: string) => `Не удалось войти как гость: ${msg}`,
  unknownError: "Неизвестная ошибка",
  securedBy: "Защищено",

  routeLoading: "Загрузка...",
  back: "Назад",

  language: "Язык",
};

const DICTS: Record<Language, Dict> = { en, ru };

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dict;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "ru") return stored;
  } catch {
    // localStorage unavailable — fall through to browser detection
  }
  const nav = typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  return nav.startsWith("ru") ? "ru" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore persistence failures
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => setLanguageState(lang), []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: DICTS[language] }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
