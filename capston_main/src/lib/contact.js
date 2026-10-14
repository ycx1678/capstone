export const CONTACT_ERROR =
  "문의 전송에 실패했습니다. 입력한 내용은 유지됩니다. 다시 시도하거나 info@capstone-pco.com으로 직접 문의해 주세요.";

export function createSubmissionId() {
  return globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function submitContact(form, submissionId, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetchImpl("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...form, submissionId }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true ||
        typeof result.id !== "string" || !result.id.trim()) {
      throw new Error(CONTACT_ERROR);
    }
    return result;
  } catch (error) {
    throw new Error(CONTACT_ERROR);
  } finally {
    clearTimeout(timeout);
  }
}
