import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const load = async (path) => import(`data:text/javascript;base64,${Buffer.from(
  await readFile(new URL(path, import.meta.url), "utf8")).toString("base64")}`);
const { handleContact, createContactWorker } = await load("../worker/contact-handler.js");
const { sendSmtpMail } = await load("../worker/smtp.js");
const { submitContact, CONTACT_ERROR } = await load("../src/lib/contact.js");
const valid = {
  name: "문의 테스트", org: "캡스톤", phone: "", email: "visitor@example.com",
  inquiry: "첫 번째 줄\n두 번째 줄", website: "",
  submissionId: "e6bca217-a0c4-4b31-9f8a-c7b132379f2e",
};
const env = { SMTP_USERNAME: "test-daum-id", SMTP_PASSWORD: "test-app-password" };
const request = (body = valid, overrides = {}) => new Request("https://www.capstone-pco.com/api/contact", {
  method: "POST",
  headers: { Origin: "https://www.capstone-pco.com", "Content-Type": "application/json" },
  body: JSON.stringify(body), ...overrides,
});
const noSend = () => { throw new Error("Must not call the email provider"); };

test("valid inquiry reaches the fixed mailbox with a Reply-To address", async () => {
  const sent = [];
  const response = await handleContact(request({ ...valid, to: "attacker@example.com" }), env,
    async mail => {
      sent.push(mail);
      return { id: mail.id };
    });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, id: `${valid.submissionId}@capstone-pco.com` });
  assert.equal(sent[0].from, "info@capstone-pco.com");
  assert.equal(sent[0].to, "info@capstone-pco.com");
  assert.equal(sent[0].replyTo, valid.email);
  assert.match(sent[0].text, /첫 번째 줄\n두 번째 줄/);
});

test("retrying the same inquiry keeps the same message ID and content", async () => {
  const attempts = [];
  const send = async mail => {
    attempts.push(mail);
    return { id: mail.id };
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

test("missing configuration and provider errors cannot be reported as success", async () => {
  assert.equal((await handleContact(request(), {}, noSend)).status, 503);
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

function smtpServer({ rejectStage, fragmented = false, stall = false } = {}) {
  const writes = [], replies = [
    "250-daum smtp\r\n250-SIZE 20000000\r\n250 AUTH LOGIN PLAIN\r\n",
    "334 VXNlcm5hbWU6\r\n", "334 UGFzc3dvcmQ6\r\n", "235 authenticated\r\n",
    "250 sender OK\r\n", "250 recipient OK\r\n", "354 send message\r\n", "250 message accepted\r\n",
  ];
  let controller, closed = false;
  const emit = text => {
    const bytes = new TextEncoder().encode(text);
    for (let offset = 0; offset < bytes.length; offset += fragmented ? 3 : bytes.length) {
      controller.enqueue(bytes.slice(offset, offset + (fragmented ? 3 : bytes.length)));
    }
  };
  const socket = {
    opened: Promise.resolve(), closed: Promise.resolve(),
    readable: new ReadableStream({ start(value) { controller = value; if (!stall) emit("220 Daum SMTP\r\n"); } }),
    writable: new WritableStream({ write(bytes) {
      writes.push(new TextDecoder().decode(bytes));
      emit(writes.length === rejectStage ? "550 delivery rejected\r\n" : replies[writes.length - 1]);
    } }),
    async close() { closed = true; controller.close(); },
  };
  return {
    writes, get closed() { return closed; },
    connect(address, options) {
      assert.deepEqual(address, { hostname: "smtp.daum.net", port: 465 });
      assert.deepEqual(options, { secureTransport: "on" });
      return socket;
    },
  };
}

const smtpMail = {
  from: "info@capstone-pco.com", to: "info@capstone-pco.com", replyTo: valid.email,
  subject: `[캡스톤 홈페이지 문의] ${"문의자".repeat(26)}`, text: "한글 문의\n.\n다음 줄",
  id: `${valid.submissionId}@capstone-pco.com`,
};

test("SMTP waits for acceptance, handles fragmented replies and encodes Korean mail safely", async () => {
  const server = smtpServer({ fragmented: true });
  const result = await sendSmtpMail(smtpMail, env, server.connect);
  assert.equal(result.id, smtpMail.id);
  assert.equal(server.closed, true);
  assert.equal(server.writes.length, 8);
  const data = server.writes.at(-1);
  assert.match(data, /Reply-To: <visitor@example.com>\r\n/);
  assert.match(data, /Message-ID: <e6bca217-a0c4-4b31-9f8a-c7b132379f2e@capstone-pco.com>/);
  const encodedWords = data.match(/=\?UTF-8\?B\?([^?]+)\?=/g);
  const subject = encodedWords.map(word => Buffer.from(word.slice(10, -2), "base64").toString("utf8")).join("");
  assert.equal(subject, smtpMail.subject);
  assert.equal(Buffer.from(data.split("\r\n\r\n")[1].slice(0, -5).replace(/\r\n/g, ""), "base64").toString("utf8"),
    "한글 문의\r\n.\r\n다음 줄");
  assert.equal(data.split("\r\n").every(line => line.length <= 998), true);
});

test("SMTP authentication or final delivery rejection cannot produce success", async () => {
  for (const stage of [4, 5, 6, 8]) {
    const server = smtpServer({ rejectStage: stage });
    await assert.rejects(sendSmtpMail(smtpMail, env, server.connect), { name: "SmtpError", code: 550 });
    assert.equal(server.closed, true);
    assert.equal(server.writes.length, stage);
  }
});

test("SMTP timeout closes the socket and never acknowledges an unaccepted message", async () => {
  const server = smtpServer({ stall: true });
  await assert.rejects(sendSmtpMail(smtpMail, env, server.connect, 25), { stage: "timeout" });
  assert.equal(server.closed, true);
});

test("SMTP rejects header injection before opening a connection", async () => {
  for (const mail of [{ ...smtpMail, replyTo: "visitor@example.com\r\nBcc: x@example.com" },
    { ...smtpMail, subject: "a\r\nBcc: x@example.com" }]) {
    await assert.rejects(sendSmtpMail(mail, env, noSend), { name: "SmtpError" });
  }
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
