const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

const root = path.join(__dirname, "..");
const output = path.join(root, "build");
esbuild.buildSync({
  entryPoints: [path.join(root, "worker", "contact-worker.js")],
  outfile: path.join(output, "_worker.js"), bundle: true, format: "esm",
  platform: "browser", target: "es2022", external: ["cloudflare:sockets"],
});
fs.writeFileSync(path.join(output, "_routes.json"), JSON.stringify({
  version: 1, include: ["/api/contact"], exclude: [],
}, null, 2));
console.log("Cloudflare contact handler included in build output.");
