const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const output = path.join(root, "build");
fs.copyFileSync(path.join(root, "worker", "contact-worker.js"), path.join(output, "_worker.js"));
fs.writeFileSync(path.join(output, "_routes.json"), JSON.stringify({
  version: 1, include: ["/api/contact"], exclude: [],
}, null, 2));
console.log("Cloudflare contact handler included in build output.");
