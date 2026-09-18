import type { Language } from "@/lib/i18n";

/**
 * Spanish dictionary. Natively written — not a machine translation of EN/RU.
 * Kept in a separate module to keep i18n.tsx readable as the language count grows.
 *
 * findingsEs(n) mirrors the plural logic of findings/findingsRu: Spanish counts
 * 1 finding specially and uses "hallazgos" for everything else.
 */

const es = {
  appName: "Skill-scanner",
  // Nav / header
  signIn: "Iniciar sesión",
  startScanning: "Empezar a escanear",
  scannedFlagged: (skills: number, flagged: number) =>
    `${skills} escaneados · ${flagged} marcados`,
  signOut: "Cerrar sesión",

  // Landing
  badge: "Análisis estático de riesgo para skills de agentes",
  heroTitle1: "Cada skill que ejecuta tu agente",
  heroTitle2: "debe ganarse tu confianza primero.",
  heroSubtitle:
    "Los skills y las herramientas MCP pueden ocultar movimientos maliciosos: comandos ofuscados, secuestro de instrucciones, exfiltración silenciosa. Skill-scanner lee la definición antes que tu agente y le pone una puntuación de 0 a 100.",
  ctaFirst: "Escanea tu primer skill",
  ctaHow: "Ver cómo funciona",
  heroNote: "Gratis · funciona localmente en Convex · ningún skill sale de tu workspace",
  mockTitle: "Resultados del escaneo",
  mockCount: (n: number) => `${n} skills analizados`,
  howTitle: "Tres pasos, sin ejecutar el agente",
  howSubtitle:
    "Nunca se ejecuta código. El skill solo se lee como texto y se analiza con algoritmos de NLP: el skill más peligroso del mundo no puede dañarte aquí.",
  rulesTitle: "Diseñado para los movimientos que importan",
  rulesSubtitle:
    "La versión 1 hace un solo trabajo: leer una lista de skills y decirte cuáles conservar.",
  ctaTitle: "Lee el skill antes de que él te lea a ti.",
  ctaSubtitle:
    "Pega un skill, recibe una puntuación y decide con evidencia. Eso es todo el producto, y ese es el punto.",
  ctaButton: "Empezar a escanear: es gratis",
  footerNote:
    "Solo análisis estático: los hallazgos son señales, no veredictos. Revísalo siempre a mano.",

  // Landing steps
  step1Title: "Pega un skill",
  step1Detail:
    "Suelta una definición de herramienta, un config de MCP, un pack de prompts o un manifiesto de extensión: cualquier texto que llegue a tu agente.",
  step2Title: "Ejecuta el escaneo",
  step2Detail:
    "Skill-scanner aplica un conjunto de reglas para patrones de abuso de agentes: ofuscación, inyección, exfiltración, persistencia, escalada.",
  step3Title: "Lee el veredicto",
  step3Detail:
    "Una puntuación de riesgo de 0 a 100 con evidencia citada: cada hallazgo cita la línea exacta que lo activó.",

  // Risk levels
  riskLabels: {
    none: "Limpio",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    critical: "Crítico",
  },
  clean: "Limpio",
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",

  // Landing mock names
  findings: (n: number) => (n === 1 ? "1 hallazgo" : `${n} hallazgos`),
  findingsRu: (n: number) => (n === 1 ? "1 hallazgo" : `${n} hallazgos`),

  // Dashboard
  dashboardTitle: "Lista de puntuaciones de riesgo",
  dashboardSubtitle:
    "Los skills que escaneas se analizan en busca de movimientos maliciosos y herramientas ocultas, y luego se ordenan por riesgo.",
  statsScanned: "Skills escaneados",
  statsFlagged: "Alto / crítico",
  statsClean: "Limpios",
  statsTop: "Puntuación máxima",
  scanSkill: "Escanear un skill",
  scanNote:
    "Nunca se ejecuta código. El skill solo se lee como texto y se analiza con algoritmos de NLP.",
  fieldName: "Nombre",
  fieldType: "Tipo",
  fieldDesc: "Descripción",
  fieldDescOptional: "(opcional)",
  descPlaceholder: "Qué dice hacer",
  fieldBody: "Manifiesto / definición",
  bodyPlaceholder:
    "Pega aquí la definición de la herramienta, el config de MCP, el texto del prompt o el manifiesto…",
  runScan: "Ejecutar escaneo",
  scanning: "Escaneando…",
  resultsTitle: "Resultados del escaneo",
  loadingResults: "cargando…",
  shown: (n: number) => `${n} mostrados`,
  filterAll: "Todos",
  filterFlagged: "Riesgo alto",
  filterClean: "Limpios",
  loadingScans: "Cargando tus escaneos…",
  emptyAllTitle: "Aún no hay skills escaneados",
  emptyAllDetail:
    "Pega tu primera herramienta, config de MCP o pack de prompts a la izquierda y ejecuta un escaneo.",
  emptyFilteredTitle: "Nada coincide con este filtro",
  emptyFilteredDetail: "Prueba otro filtro o escanea otro skill.",
  noFindings:
    "No se detectaron patrones de manipulación: todas las reglas salieron limpias.",
  severity: "peso",
  removeFromList: "Quitar de la lista",
  exportReport: "Exportar protocolo",
  showFindings: "Mostrar hallazgos",
  hideFindings: "Ocultar hallazgos",

  // Kinds
  kindTool: "Herramienta",
  kindMcp: "MCP",
  kindPrompt: "Pack de prompts",
  kindExtension: "Extensión",

  // Toasts
  toastScanned: (name: string, score: number, level: string) =>
    `Escaneado "${name}": riesgo ${score}/100 (${level})`,
  toastScanFailed: "El escaneo falló. Revisa el contenido e inténtalo de nuevo.",
  toastRemoved: "Eliminado de tu lista",
  toastRemoveFailed: "No se pudo eliminar el skill",

  // Auth
  authTitle: "Comenzar",
  authSubtitle: "Introduce tu correo para iniciar sesión o registrarte",
  emailPlaceholder: "nombre@ejemplo.com",
  or: "O",
  continueGuest: "Continuar como invitado",
  checkEmail: "Revisa tu correo",
  codeSent: (email: string) => `Enviamos un código a ${email}`,
  noCode: "¿No recibiste el código?",
  tryAgain: "Intentar de nuevo",
  useDifferentEmail: "Usar otro correo",
  verifyCode: "Verificar código",
  verifying: "Verificando…",
  wrongCode: "El código de verificación que introdujiste es incorrecto.",
  sendFailed: "No se pudo enviar el código de verificación. Inténtalo de nuevo.",
  guestFailed: (msg: string) => `No se pudo entrar como invitado: ${msg}`,
  unknownError: "Error desconocido",
  securedBy: "Protegido por",

  // Loading
  routeLoading: "Cargando...",
  back: "Atrás",

  // Language switcher
  language: "Idioma",
};

export default es;
export const esLanguage: Language = "es";
