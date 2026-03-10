export function humanBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const u = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

export function estimateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const idx = dataUrl.indexOf("base64,");
  if (idx === -1) return 0;
  const b64 = dataUrl.slice(idx + 7);
  const padding = (b64.match(/=+$/) || [""])[0].length;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

export function traverseAndSumDataUrls(node) {
  let sum = 0;
  const seen = new Set();
  const walk = (x) => {
    if (x == null) return;
    if (typeof x === "string") {
      if (x.startsWith("data:image/") && !seen.has(x)) {
        sum += estimateDataUrlBytes(x);
        seen.add(x);
      }
      return;
    }
    if (Array.isArray(x)) {
      for (const v of x) walk(v);
      return;
    }
    if (typeof x === "object") {
      for (const k of Object.keys(x)) walk(x[k]);
    }
  };
  walk(node);
  return sum;
}
