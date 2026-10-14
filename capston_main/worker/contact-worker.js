import { createContactWorker } from "./contact-handler.js";
import { submitNetlifyContact } from "./netlify.js";

export default createContactWorker(form => submitNetlifyContact(form));
