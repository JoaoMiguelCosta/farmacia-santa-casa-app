import { AUTH_SESSION_CONFIG } from "../config/auth.config";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readLastActivityAt() {
  if (!canUseStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(
      AUTH_SESSION_CONFIG.lastActivityStorageKey,
    );

    const value = Number(rawValue);

    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function writeLastActivityAt(timestamp = Date.now()) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      AUTH_SESSION_CONFIG.lastActivityStorageKey,
      String(timestamp),
    );
  } catch {
    // Sem ação: se o storage falhar, a sessão continua protegida pelo cookie/JWT.
  }
}

export function clearLastActivityAt() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(AUTH_SESSION_CONFIG.lastActivityStorageKey);
  } catch {
    // Sem ação.
  }
}
