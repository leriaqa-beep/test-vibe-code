import * as fs from 'fs';
import * as path from 'path';

const LOGS_DIR = path.join(__dirname, '../../logs');

function getLogPath(subdir: string, prefix: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dir = path.join(LOGS_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${prefix}-${date}.log`);
}

function formatEntry(level: string, message: string, extra?: unknown): string {
  const ts = new Date().toISOString();
  let line = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (extra instanceof Error) {
    line += `\n  stack: ${extra.stack ?? extra.message}`;
  } else if (extra !== undefined) {
    line += `\n  data: ${JSON.stringify(extra)}`;
  }
  return line + '\n';
}

function write(filePath: string, entry: string) {
  try {
    fs.appendFileSync(filePath, entry, 'utf-8');
  } catch {
    // Never crash the app because of a logging failure
  }
}

export const logger = {
  /** Generic errors → logs/errors/error-YYYY-MM-DD.log */
  error(message: string, err?: unknown) {
    const entry = formatEntry('error', message, err);
    console.error(entry.trim());
    write(getLogPath('errors', 'error'), entry);
  },

  /** Warnings → logs/errors/error-YYYY-MM-DD.log */
  warn(message: string, data?: unknown) {
    const entry = formatEntry('warn', message, data);
    console.warn(entry.trim());
    write(getLogPath('errors', 'error'), entry);
  },

  /** General info → console only */
  info(message: string) {
    console.log(`[INFO] ${message}`);
  },

  /** AI/Gemini events (quota, fallback, etc.) → logs/ai/ai-YYYY-MM-DD.log */
  ai(message: string, err?: unknown) {
    const entry = formatEntry('ai', message, err);
    console.warn(entry.trim());
    write(getLogPath('ai', 'ai'), entry);
  },

  /** HTTP request log → logs/requests/requests-YYYY-MM-DD.log */
  request(method: string, url: string, status: number, ms: number) {
    const entry = formatEntry('request', `${method} ${url} ${status} ${ms}ms`);
    write(getLogPath('requests', 'requests'), entry);
  },
};
