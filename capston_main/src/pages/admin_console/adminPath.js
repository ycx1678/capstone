export function deepClone(obj) {
  return typeof structuredClone === "function"
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function reorder(arr, from, to) {
  const a = arr.slice();
  const [m] = a.splice(from, 1);
  a.splice(to, 0, m);
  return a;
}

/** path: a.b[0].c or a.b.0.c */
export function parsePath(path) {
  const tokens = [];
  const re = /([^[.\]]+)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(path))) {
    if (m[1] != null) {
      const v = m[1];
      tokens.push(/^\d+$/.test(v) ? Number(v) : v);
    } else {
      tokens.push(Number(m[2]));
    }
  }
  return tokens;
}

export function getByPath(obj, path) {
  const keys = Array.isArray(path) ? path : parsePath(path);
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}

export function setByPath(obj, path, value) {
  const keys = Array.isArray(path) ? path : parsePath(path);
  if (!keys.length) return obj;

  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextK = keys[i + 1];
    if (cur[k] == null) cur[k] = typeof nextK === "number" ? [] : {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}
