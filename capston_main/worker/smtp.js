const encoder = new TextEncoder();

class SmtpError extends Error {
  constructor(stage, code) {
    super("SMTP delivery failed");
    this.name = "SmtpError";
    this.stage = stage;
    this.code = code;
  }
}

function base64(value) {
  return btoa(Array.from(encoder.encode(value), byte => String.fromCharCode(byte)).join(""));
}

function subjectHeader(value) {
  const words = [];
  let part = "";
  for (const char of value) {
    if (encoder.encode(part + char).length > 42) {
      words.push(`=?UTF-8?B?${base64(part)}?=`);
      part = "";
    }
    part += char;
  }
  if (part) words.push(`=?UTF-8?B?${base64(part)}?=`);
  return words.join("\r\n ");
}

function message(mail) {
  for (const value of [mail.from, mail.to, mail.replyTo]) {
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
      throw new SmtpError("invalid-address");
    }
  }
  if (!/^[a-zA-Z0-9-]{16,80}@capstone-pco\.com$/.test(mail.id) || /[\r\n]/.test(mail.subject)) {
    throw new SmtpError("invalid-header");
  }
  const body = base64(mail.text.replace(/\r?\n/g, "\r\n")).match(/.{1,76}/g)?.join("\r\n") || "";
  return [
    `From: CAPSTONE <${mail.from}>`, `To: <${mail.to}>`, `Reply-To: <${mail.replyTo}>`,
    `Subject: ${subjectHeader(mail.subject)}`, `Message-ID: <${mail.id}>`,
    `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", body,
  ].join("\r\n") + "\r\n.\r\n";
}

// Only the existing Daum server is contacted, always with TLS from the first byte.
export async function sendSmtpMail(mail, env, connect, timeoutMs = 15000) {
  if (typeof env.SMTP_USERNAME !== "string" || !/^[A-Za-z0-9_.@+-]{1,254}$/.test(env.SMTP_USERNAME) ||
      typeof env.SMTP_PASSWORD !== "string" || !env.SMTP_PASSWORD || /[\r\n\x00]/.test(env.SMTP_PASSWORD)) {
    throw new SmtpError("invalid-configuration");
  }
  const data = message(mail);
  const socket = connect({ hostname: "smtp.daum.net", port: 465 }, { secureTransport: "on" });
  socket.closed.catch(() => {});
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  let buffer = "", timeout;
  async function line() {
    for (;;) {
      const end = buffer.indexOf("\r\n");
      if (end !== -1) {
        if (end > 4096) throw new SmtpError("invalid-response");
        const result = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        return result;
      }
      if (buffer.length > 4096) throw new SmtpError("invalid-response");
      const { done, value } = await reader.read();
      if (done) throw new SmtpError("connection-closed");
      buffer += new TextDecoder().decode(value);
    }
  }
  async function reply(expected, stage) {
    const lines = [];
    for (let count = 0; count < 32; count += 1) {
      const value = await line();
      const match = /^(\d{3})([ -])(.*)$/.exec(value);
      if (!match || Number(match[1]) !== expected) {
        throw new SmtpError(stage, match ? Number(match[1]) : undefined);
      }
      lines.push(match[3]);
      if (match[2] === " ") return lines;
    }
    throw new SmtpError("invalid-response");
  }
  async function command(value, expected, stage) {
    await writer.write(encoder.encode(value + "\r\n"));
    return reply(expected, stage);
  }
  async function deliver() {
    await socket.opened;
    await reply(220, "greeting");
    const capabilities = await command("EHLO www.capstone-pco.com", 250, "ehlo");
    if (!capabilities.some(value => /^AUTH[ =].*\bLOGIN\b/i.test(value))) {
      throw new SmtpError("authentication-unavailable");
    }
    await command("AUTH LOGIN", 334, "authentication");
    await command(base64(env.SMTP_USERNAME), 334, "authentication");
    await command(base64(env.SMTP_PASSWORD), 235, "authentication");
    await command(`MAIL FROM:<${mail.from}>`, 250, "sender");
    await command(`RCPT TO:<${mail.to}>`, 250, "recipient");
    await command("DATA", 354, "data");
    await writer.write(encoder.encode(data));
    await reply(250, "delivery");
    // A receipt is returned only after the server has accepted the full message.
    return { id: mail.id };
  }
  try {
    return await Promise.race([
      deliver(),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new SmtpError("timeout")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
    await socket.close().catch(() => {});
  }
}
