import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const load = async (path) => import(`data:text/javascript;base64,${Buffer.from(
  await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const { handleContact, createContactWorker } = await load("../worker/contact-handler.js");
const { submitNetlifyContact } = await load("../worker/netlify.js");
const { submitContact, CONTACT_ERROR } = await load("../src/lib/contact.js");
const valid = {
  name: "문의 테스트", org: "캡스톤", phone: "", email: "visitor@example.com",
  inquiry: "첫 번째 줄\n두 번째 줄", website: "",
  submissionId: "e6bca217-a0c4-4b31-9f8a-c7b132379f2e",
};
const env = {};
const request = (body = valid, overrides = {}) => new Request("https://www.capstone-pco.com/api/contact", {
  method: "POST",
  headers: { Origin: "https://www.capstone-pco.com", "Content-Type": "application/json" },
  body: JSON.stringify(body), ...overrides,
});
const noSend = () => { throw new Error("Must not call the email provider"); };

test("valid inquiry forwards only approved fields to the contact adapter", async () => {
  const sent = [];
  const response = await handleContact(request({ ...valid, to: "attacker@example.com" }), env,
    async form => {
      sent.push(form);
      return { id: "netlify:accepted-request-id" };
    });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, id: "netlify:accepted-request-id" });
  assert.equal(sent[0].to, undefined);
  assert.equal(sent[0].email, valid.email);
  assert.match(sent[0].inquiry, /첫 번째 줄\n두 번째 줄/);
});

test("retrying the same inquiry keeps the same tracking ID and content", async () => {
  const attempts = [];
  const send = async form => {
    attempts.push(form);
    return { id: "netlify:request-id" };
  };
  await handleContact(request(), env, send);
  await handleContact(request(), env, send);
  assert.deepEqual(attempts[0], attempts[1]);
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

test("missing acknowledgements and provider errors cannot be reported as success", async () => {
  for (const result of [null, {}, { id: "" }]) {
    const response = await handleContact(request(), env, async () => result);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  }
  assert.equal((await handleContact(request(), env, async () => {
    throw new Error("provider unavailable");
  })).status, 502);
});

test("Pages continues to serve static assets outside the contact route", async () => {
  const response = await createContactWorker(noSend).fetch(new Request("https://www.capstone-pco.com/static/styles.css"), {
    ASSETS: { fetch: async () => new Response("existing asset", { status: 200 }) },
  });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "existing asset");
});

const receipt = "<html><h1>Thank you!</h1><p>Your form submission has been received.</p></html>";
const acceptedResponse = (html = receipt, headers = {}) => new Response(html, {
  headers: { "Content-Type": "text/html", "x-nf-request-id": "confirmed-request-id", ...headers },
});

test("Netlify adapter posts to the existing fixed form and preserves the reply email", async () => {
  const result = await submitNetlifyContact({ ...valid, to: "attacker@example.com" }, async (url, options) => {
    assert.equal(url, "https://deft-kangaroo-cf7474.netlify.app/");
    assert.equal(options.redirect, "manual");
    const body = new URLSearchParams(options.body);
    assert.equal(body.get("form-name"), "capstone-contact");
    assert.equal(body.get("bot-field"), "");
    assert.equal(body.get("email"), valid.email);
    assert.equal(body.has("to"), false);
    assert.match(body.get("inquiry"), /첫 번째 줄\n두 번째 줄/);
    assert.equal(body.get("inquiry").includes(valid.submissionId), true);
    return acceptedResponse();
  });
  assert.deepEqual(result, { id: "netlify:confirmed-request-id" });
});

test("Netlify redirects, static homepage fallbacks, missing receipts and HTTP errors are rejected", async () => {
  for (const response of [
    new Response(null, { status: 301, headers: { Location: "https://www.capstone-pco.com/" } }),
    new Response(null, { status: 405 }), acceptedResponse("<html>Existing homepage</html>"),
    acceptedResponse(receipt, { "x-nf-request-id": "" }),
    acceptedResponse(receipt, { "Content-Type": "application/json" }),
  ]) {
    await assert.rejects(submitNetlifyContact(valid, async () => response));
  }
});

test("Netlify network failures and oversized receipts cannot acknowledge a submission", async () => {
  await assert.rejects(submitNetlifyContact(valid, async () => { throw new TypeError("Network unavailable"); }));
  await assert.rejects(submitNetlifyContact(valid, async () => acceptedResponse(receipt + "x".repeat(33000))));
});

test("the same inquiry keeps the same tracking content when forwarded again", async () => {
  const attempts = [];
  const send = async (_, options) => { attempts.push(options.body); return acceptedResponse(); };
  await submitNetlifyContact(valid, send);
  await submitNetlifyContact(valid, send);
  assert.equal(attempts[0], attempts[1]);
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
