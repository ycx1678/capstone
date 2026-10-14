import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const load = async (path) => import(`data:text/javascript;base64,${Buffer.from(
  await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const { handleContact, default: worker } = await load("../worker/contact-worker.js");
const { submitContact, CONTACT_ERROR } = await load("../src/lib/contact.js");
const valid = {
  name: "문의 테스트", org: "캡스톤", phone: "", email: "visitor@example.com",
  inquiry: "첫 번째 줄\n두 번째 줄", website: "",
  submissionId: "e6bca217-a0c4-4b31-9f8a-c7b132379f2e",
};
const env = { RESEND_API_KEY: "test-key", CONTACT_FROM_EMAIL: "website@forms.capstone-pco.com" };
const request = (body = valid, overrides = {}) => new Request("https://www.capstone-pco.com/api/contact", {
  method: "POST",
  headers: { Origin: "https://www.capstone-pco.com", "Content-Type": "application/json" },
  body: JSON.stringify(body), ...overrides,
});
const noSend = () => { throw new Error("Must not call the email provider"); };

test("valid inquiry reaches the fixed mailbox with a Reply-To address", async () => {
  const sent = [];
  const response = await handleContact(request({ ...valid, to: "attacker@example.com" }), env,
    async (url, options) => {
      sent.push({ url, options, body: JSON.parse(options.body) });
      return Response.json({ id: "accepted-email-id" });
    });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, id: "accepted-email-id" });
  assert.equal(sent[0].url, "https://api.resend.com/emails");
  assert.deepEqual(sent[0].body.to, ["info@capstone-pco.com"]);
  assert.equal(sent[0].body.reply_to, valid.email);
  assert.match(sent[0].body.text, /첫 번째 줄\n두 번째 줄/);
});

test("retrying the same inquiry uses the same key and identical email content", async () => {
  const attempts = [];
  const send = async (_, options) => {
    attempts.push(options);
    return Response.json({ id: "same-email-id" });
  };
  await handleContact(request(), env, send);
  await handleContact(request(), env, send);
  assert.equal(attempts[0].headers["Idempotency-Key"], attempts[1].headers["Idempotency-Key"]);
  assert.equal(attempts[0].body, attempts[1].body);
});

test("validation and honeypot failures never send an email", async () => {
  for (const body of [
    { ...valid, name: " " }, { ...valid, inquiry: "" },
    { ...valid, email: "bad-email" }, { ...valid, email: "a@example.com\nBcc: x@example.com" },
    { ...valid, name: "a".repeat(81) }, { ...valid, inquiry: "a".repeat(4001) },
    { ...valid, website: "spam" }, { ...valid, submissionId: "" }, [], null,
  ]) {
    assert.equal((await handleContact(request(body), env, noSend)).status, 400);
  }
});

test("cross-site requests, unsupported methods and oversized input are rejected", async () => {
  assert.equal((await handleContact(request(valid, { headers: {
    Origin: "https://unrelated.example", "Content-Type": "application/json",
  } }), env, noSend)).status, 403);
  assert.equal((await handleContact(new Request("https://www.capstone-pco.com/api/contact"), env, noSend)).status, 405);
  assert.equal((await handleContact(request(valid, { body: "x".repeat(17000) }), env, noSend)).status, 413);
  assert.equal((await handleContact(request(valid, { body: "invalid JSON" }), env, noSend)).status, 400);
});

test("missing configuration and provider errors cannot be reported as success", async () => {
  assert.equal((await handleContact(request(), {}, noSend)).status, 503);
  for (const result of [Response.json({ error: "rejected" }, { status: 403 }),
    Response.json({}), new Response("unexpected HTML", { status: 200 })]) {
    const response = await handleContact(request(), env, async () => result);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  }
  assert.equal((await handleContact(request(), env, async () => {
    throw new Error("provider unavailable");
  })).status, 502);
});

test("Pages continues to serve static assets outside the contact route", async () => {
  const response = await worker.fetch(new Request("https://www.capstone-pco.com/static/styles.css"), {
    ASSETS: { fetch: async () => new Response("existing asset", { status: 200 }) },
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "existing asset");
});

test("browser sends JSON to the contact endpoint and requires a delivery reference", async () => {
  const result = await submitContact(valid, valid.submissionId, async (url, options) => {
    assert.equal(url, "/api/contact");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(JSON.parse(options.body).submissionId, valid.submissionId);
    return Response.json({ ok: true, id: "accepted-email-id" });
  });
  assert.equal(result.id, "accepted-email-id");
});

test("browser rejects HTTP 405, HTML fallback, missing references and network failure", async () => {
  for (const response of [new Response(null, { status: 405 }),
    new Response("<html>static site</html>"), Response.json({ ok: true }),
    Response.json({ ok: false, id: "not-delivered" })]) {
    await assert.rejects(submitContact(valid, valid.submissionId, async () => response),
      { message: CONTACT_ERROR });
  }
  await assert.rejects(submitContact(valid, valid.submissionId, async () => {
    throw new Error("network error");
  }), { message: CONTACT_ERROR });
});

const componentSource = await readFile(new URL("../src/components/sections/ContactSection.js", import.meta.url), "utf8");
const handlerStart = componentSource.indexOf("const handleSubmit = async (e) => {");
const handlerSource = componentSource.slice(handlerStart, componentSource.indexOf("\n  return (", handlerStart));
function componentHarness(send) {
  const states = [], cleared = [];
  const context = {
    form: valid, sending: { current: false }, submissionId: { current: valid.submissionId },
    CONTACT_ERROR, createSubmissionId: () => valid.submissionId,
    submitContact: send, setIsSubmitting() {},
    setSubmitState: state => states.push(state), setForm: value => cleared.push(value),
  };
  const submit = vm.runInNewContext(handlerSource + "\nhandleSubmit;", context);
  return { submit: () => submit({ preventDefault() {} }), context, states, cleared };
}

test("the form preserves entered values and retry ID after a rejected delivery", async () => {
  const ui = componentHarness((form, id) => submitContact(form, id,
    async () => new Response(null, { status: 405 })));
  await ui.submit();
  assert.equal(ui.states.at(-1).ok, false);
  assert.equal(ui.states.at(-1).error, true);
  assert.equal(ui.cleared.length, 0);
  assert.equal(ui.context.submissionId.current, valid.submissionId);
  assert.equal(ui.context.sending.current, false);
});

test("the form sends once on double click and clears only after confirmed delivery", async () => {
  let calls = 0, release;
  const ui = componentHarness(async () => {
    calls += 1;
    await new Promise(resolve => { release = resolve; });
    return { ok: true, id: "confirmed" };
  });
  const first = ui.submit();
  await ui.submit();
  assert.equal(calls, 1);
  assert.equal(ui.cleared.length, 0);
  release();
  await first;
  assert.equal(ui.states.at(-1).ok, true);
  assert.equal(ui.cleared.length, 1);
  assert.equal(ui.cleared[0].inquiry, "");
  assert.equal(ui.context.submissionId.current, null);
});
