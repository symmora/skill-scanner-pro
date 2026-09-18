/**
 * Rule catalog: client-side metadata for the analyzer's rule IDs.
 * The DB stores only ruleId, severity and evidence snippets, so titles and
 * explanations live here — which means already-saved scans translate too.
 */

export interface RuleMeta {
  title: { en: string; ru: string; es: string };
  detail: { en: string; ru: string; es: string };
}

export const RULE_CATALOG: Record<string, RuleMeta> = {
  CMD_OBFUSCATION: {
    title: {
      en: "Obfuscated shell command",
      ru: "Обфусцированная shell-команда",
      es: "Comando de shell ofuscado",
    },
    detail: {
      en: "Base64/hex blobs piped into an interpreter hide what actually runs. Classic way to smuggle a payload past human review.",
      ru: "Base64/hex-блоки, передаваемые в интерпретатор, скрывают, что реально выполняется. Классический способ провести полезную нагрузку мимо проверки человеком.",
      es: "Los bloques en base64/hex canalizados a un intérprete ocultan lo que realmente se ejecuta. La forma clásica de colar una carga útil ante la revisión humana.",
    },
  },
  ENCODED_SECRETS: {
    title: {
      en: "Encoded blob that looks like a secret",
      ru: "Закодированный блок, похожий на секрет",
      es: "Bloque codificado que parece un secreto",
    },
    detail: {
      en: "A long base64/hex literal may conceal credentials or a second-stage payload. Decode it manually before trusting the skill.",
      ru: "Длинная base64/hex-строка может скрывать учётные данные или полезную нагрузку второй стадии. Декодируйте её вручную, прежде чем доверять навыку.",
      es: "Una cadena larga en base64/hex puede ocultar credenciales o una carga de segunda etapa. Decodifícala a mano antes de confiar en el skill.",
    },
  },
  EXFIL_HTTP: {
    title: {
      en: "Sends data to an external endpoint",
      ru: "Отправка данных на внешний сервер",
      es: "Envía datos a un servidor externo",
    },
    detail: {
      en: "curl/wget/POST to a remote host can quietly ship your files, env vars, or conversation history to an attacker-controlled server.",
      ru: "curl/wget/POST на удалённый сервер может тихо отправлять ваши файлы, переменные окружения или историю разговора на сервер злоумышленника.",
      es: "curl/wget/POST a un host remoto puede enviar en silencio tus archivos, variables de entorno o historial de conversación a un servidor del atacante.",
    },
  },
  EXFIL_ENV: {
    title: {
      en: "Reads environment variables / secrets",
      ru: "Чтение переменных окружения и секретов",
      es: "Lee variables de entorno / secretos",
    },
    detail: {
      en: "Reading env, .env, or credential files lets a skill harvest API keys — pair that with any network call and it is exfiltration.",
      ru: "Чтение env, .env или файлов учётных данных позволяет навыку собирать API-ключи — вместе с любым сетевым вызовом это эксфильтрация.",
      es: "Leer env, .env o archivos de credenciales permite al skill recolectar claves API: combinado con cualquier llamada de red es exfiltración.",
    },
  },
  FILE_SWEEP: {
    title: {
      en: "Broad filesystem access",
      ru: "Широкий доступ к файловой системе",
      es: "Acceso amplio al sistema de archivos",
    },
    detail: {
      en: "Recursive reads/writes over home or root directories are how skills gather material to exfiltrate — and how they can destroy data.",
      ru: "Рекурсивное чтение/запись в домашних или корневых каталогах — так навыки собирают материал для эксфильтрации и уничтожают данные.",
      es: "La lectura/escritura recursiva sobre el directorio home o la raíz es cómo los skills reúnen material para exfiltrar y cómo pueden destruir datos.",
    },
  },
  PROMPT_INJECTION: {
    title: {
      en: "Instruction override inside skill text",
      ru: "Перехват инструкций в тексте навыка",
      es: "Anulación de instrucciones dentro del texto del skill",
    },
    detail: {
      en: "Phrases like 'ignore previous instructions' or 'you must now' try to hijack the agent away from the user's intent — the core malicious movement for prompt/extension skills. Detects both English and Russian phrasing.",
      ru: "Фразы вроде «игнорируй предыдущие инструкции» или «теперь ты должен» пытаются увести агента от намерений пользователя — это основное вредоносное действие для prompt/extension-навыков. Работает и для английских, и для русских формулировок.",
      es: "Frases como «ignore previous instructions» o «ahora debes» intentan secuestrar al agente y desviarlo de la intención del usuario: el movimiento malicioso principal para skills de tipo prompt/extensión.",
    },
  },
  TOOL_HIJACK: {
    title: {
      en: "Hidden tool invocation or shadow config",
      ru: "Скрытый вызов инструментов или теневой конфиг",
      es: "Invocación oculta de herramientas o config sombra",
    },
    detail: {
      en: "MCP/extension configs that call extra servers, run arbitrary commands, or auto-approve can expose tools the user never agreed to.",
      ru: "MCP/extension-конфиги, которые вызывают лишние серверы, запускают произвольные команды или авто-подтверждают действия, могут открыть инструменты, на которые пользователь не соглашался.",
      es: "Los configs de MCP/extensiones que llaman a servidores extra, ejecutan comandos arbitrarios o auto-aprueban pueden exponer herramientas que el usuario nunca aceptó.",
    },
  },
  SILENT_INSTALL: {
    title: {
      en: "Installs software without asking",
      ru: "Установка программ без спроса",
      es: "Instala software sin preguntar",
    },
    detail: {
      en: "Silent package installs (pip/npm/curl-to-shell) can pull in compromised dependencies or a reverse shell at first run.",
      ru: "Тихая установка пакетов (pip/npm/curl-to-shell) может подтянуть скомпрометированные зависимости или reverse shell при первом запуске.",
      es: "Las instalaciones silenciosas de paquetes (pip/npm/curl-a-shell) pueden traer dependencias comprometidas o una reverse shell al primer uso.",
    },
  },
  PERSISTENCE: {
    title: {
      en: "Tries to survive restarts",
      ru: "Попытка пережить перезапуск",
      es: "Intenta sobrevivir a los reinicios",
    },
    detail: {
      en: "Writing cron jobs, shell profiles, launch agents, or autostart entries means the skill wants to keep running after the session ends.",
      ru: "Запись в cron, профили shell, launch agents, автозагрузку или планировщик задач означает, что навык хочет продолжать работать после завершения сессии.",
      es: "Escribir cron, perfiles de shell, launch agents o entradas de autoinicio significa que el skill quiere seguir corriendo cuando termine la sesión.",
    },
  },
  PRIVILEGE_ESCALATION: {
    title: {
      en: "Requests elevated privileges",
      ru: "Запрос повышенных привилегий",
      es: "Solicita privilegios elevados",
    },
    detail: {
      en: "sudo, uid spoofing, or container escapes give a skill power far beyond what a helper needs.",
      ru: "sudo, подмена uid или побег из контейнера дают навыку власть, далеко выходящую за рамки помощника.",
      es: "sudo, suplantación de uid o escapes de contenedor dan al skill un poder muy superior al que necesita un asistente.",
    },
  },
};

export function getRuleMeta(ruleId: string): RuleMeta {
  return (
    RULE_CATALOG[ruleId] ?? {
      title: { en: ruleId, ru: ruleId, es: ruleId },
      detail: {
        en: "No description available for this rule.",
        ru: "Описание для этого правила недоступно.",
        es: "No hay descripción disponible para esta regla.",
      },
    }
  );
}
