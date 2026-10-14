const ENDPOINT = "https://deft-kangaroo-cf7474.netlify.app/";
const MAX_RECEIPT_BYTES = 32768;

async function readReceipt(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Missing form receipt");
  const decoder = new TextDecoder();
  let html = "", length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_RECEIPT_BYTES) {
      await reader.cancel();
      throw new Error("Oversized form receipt");
    }
    html += decoder.decode(value, { stream: true });
  }
  return html + decoder.decode();
}

// Existing Netlify form notifications deliver to info@capstone-pco.com.
// The endpoint and form name are fixed so callers cannot change the destination.
export async function submitNetlifyContact(form, fetchImpl = fetch) {
  const body = new URLSearchParams({
    "form-name": "capstone-contact", "bot-field": "",
    name: form.name, org: form.org, phone: form.phone, email: form.email,
    inquiry: `${form.inquiry}\n\n접수번호: ${form.submissionId}`,
  });
  const response = await fetchImpl(ENDPOINT, {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(), signal: AbortSignal.timeout(10000),
  });
  const id = response.headers.get("x-nf-request-id");
  if (response.status !== 200 || !id?.trim() ||
      !response.headers.get("Content-Type")?.startsWith("text/html")) {
    throw new Error("Form submission rejected");
  }
  const html = await readReceipt(response);
  if (!/<h1[^>]*>\s*Thank you!\s*<\/h1>/i.test(html) ||
      !html.includes("Your form submission has been received")) {
    throw new Error("Missing Netlify form acknowledgement");
  }
  return { id: `netlify:${id}` };
}
