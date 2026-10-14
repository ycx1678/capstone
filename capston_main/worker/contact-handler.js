const MAX_BODY_BYTES = 16384;
const ALLOWED_ORIGINS = new Set([
  "https://www.capstone-pco.com", "https://capstone-pco.com",
  "https://capstone-site-46s.pages.dev",
]);
const DELIVERY_ERROR = "현재 문의를 전송할 수 없습니다. 다시 시도하거나 info@capstone-pco.com으로 직접 문의해 주세요.";

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

async function readBody(request) {
  if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES) {
    throw new RangeError("body too large");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("empty body");
  const chunks = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError("body too large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleContact(request, env, submitForm) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }
  const origin = request.headers.get("Origin") || "";
  const isPreview = /^https:\/\/[a-z0-9-]+\.capstone-site-46s\.pages\.dev$/.test(origin);
  if ((!ALLOWED_ORIGINS.has(origin) && !isPreview) ||
      request.headers.get("Sec-Fetch-Site") === "cross-site") {
    return json({ ok: false, error: "요청한 사이트를 확인할 수 없습니다." }, 403);
  }
  if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json") {
    return json({ ok: false, error: "잘못된 요청 형식입니다." }, 415);
  }
  let input;
  try { input = await readBody(request); }
  catch (error) {
    return json({ ok: false, error: "문의 내용을 확인해 주세요." },
      error instanceof RangeError ? 413 : 400);
  }
  if (!input || typeof input !== "object" || Array.isArray(input) ||
      (input.website !== undefined && input.website !== "")) {
    return json({ ok: false, error: "잘못된 요청입니다." }, 400);
  }
  const limits = { name: 80, org: 120, phone: 50, email: 254, inquiry: 4000 };
  const form = {};
  for (const [key, limit] of Object.entries(limits)) {
    const value = input[key] ?? "";
    if (typeof value !== "string" || value.length > limit ||
        (key !== "inquiry" && /[\r\n]/.test(value))) {
      return json({ ok: false, error: "문의 내용을 확인해 주세요." }, 400);
    }
    form[key] = value.trim();
  }
  if (!form.name || !form.inquiry ||
      !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email) ||
      typeof input.submissionId !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(input.submissionId)) {
    return json({ ok: false, error: "이름, 이메일과 문의 내용을 확인해 주세요." }, 400);
  }
  try {
    const result = await submitForm({ ...form, submissionId: input.submissionId });
    if (typeof result?.id !== "string" || !result.id.trim()) {
      console.warn("Contact delivery returned no receipt");
      return json({ ok: false, error: DELIVERY_ERROR }, 502);
    }
    return json({ ok: true, id: result.id });
  } catch (error) {
    console.warn("Contact delivery unavailable", error.name);
    return json({ ok: false, error: DELIVERY_ERROR }, 502);
  }
}

export function createContactWorker(submitForm) {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);
      if (url.pathname === "/api/contact") {
        return handleContact(request, env, form => submitForm(form, env));
      }
      return env.ASSETS.fetch(request);
    },
  };
}
