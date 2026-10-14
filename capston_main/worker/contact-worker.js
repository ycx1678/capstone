import { connect } from "cloudflare:sockets";
import { createContactWorker } from "./contact-handler.js";
import { sendSmtpMail } from "./smtp.js";

export default createContactWorker((mail, env) => sendSmtpMail(mail, env, connect));
