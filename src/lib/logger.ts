type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  service: string;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, context: Record<string, unknown>, message: string) {
  const entry: LogEntry = {
    level,
    service: "kaj-shohayok",
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const logFn =
    level === "error"
      ? console.error
      : level === "warn"
      ? console.warn
      : console.log;

  if (process.env.NODE_ENV === "production") {
    logFn(JSON.stringify(entry));
  } else {
    const { level: l, service, message: msg, timestamp, ...rest } = entry;
    const prefix = `[${timestamp}] [${l.toUpperCase()}] [${service}]`;
    const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : "";
    logFn(`${prefix} ${msg}${extra}`);
  }
}

export const logger = {
  debug: (context: Record<string, unknown>, message: string) =>
    log("debug", context, message),
  info: (context: Record<string, unknown>, message: string) =>
    log("info", context, message),
  warn: (context: Record<string, unknown>, message: string) =>
    log("warn", context, message),
  error: (context: Record<string, unknown>, message: string) =>
    log("error", context, message),
};
