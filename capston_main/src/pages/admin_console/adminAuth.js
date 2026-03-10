const PIN_ENV = process.env.REACT_APP_ADMIN_PIN;
const DEFAULT_PIN = "2580";

const AUTH_KEY = "capstone_admin_auth_v1";
const FAIL_KEY = "capstone_admin_fail_v1";

export function nowMs() {
  return Date.now();
}

function safeJsonParse(v, fallback) {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}

export function getExpectedPin() {
  return (PIN_ENV && String(PIN_ENV).trim()) || DEFAULT_PIN;
}

export function getSavedAuth() {
  const raw = localStorage.getItem(AUTH_KEY);
  const parsed = safeJsonParse(raw, null);
  if (!parsed?.ok || !parsed?.exp) return null;
  if (parsed.exp < nowMs()) return null;
  return parsed;
}

export function setSavedAuth(days = 30) {
  const exp = nowMs() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ok: true, exp }));
}

export function clearSavedAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function getFailState() {
  const raw = localStorage.getItem(FAIL_KEY);
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== "object") return { count: 0, lockUntil: 0 };
  return {
    count: Number(parsed.count) || 0,
    lockUntil: Number(parsed.lockUntil) || 0,
  };
}

export function setFailState(next) {
  localStorage.setItem(FAIL_KEY, JSON.stringify(next));
}

export function clearFailState() {
  localStorage.removeItem(FAIL_KEY);
}
