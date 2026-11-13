/* eslint-disable @typescript-eslint/no-require-imports -- Passenger loads app.js as CommonJS. */
// Passenger intercepts the HTTP listen call in this process.
const { existsSync, realpathSync } = require("node:fs");
const { createServer } = require("node:http");
const { createRequire } = require("node:module");
const path = require("node:path");

function loadProductionEnv(dir, load) {
  load("@next/env").loadEnvConfig(dir, false);
  if (
    process.env.DATA_DIR !== "/home/websitemake4u/4ss-data" ||
    process.env.SITE_URL !== "https://4ss.spydermesh.com" ||
    (process.env.SESSION_SECRET?.length ?? 0) < 32 ||
    process.env.INSECURE_COOKIES === "1"
  ) {
    throw new Error("Check the cPanel production environment (DATA_DIR, SITE_URL, SESSION_SECRET and INSECURE_COOKIES).");
  }
  process.env.REQUIRE_EXISTING_DB = "1";
}

async function start() {
  process.env.NODE_ENV = "production";
  const current = path.join(__dirname, "current");
  const deployed = existsSync(current);
  const dir = deployed ? realpathSync(current) : __dirname;
  const load = createRequire(path.join(dir, "package.json"));
  const checkEnv = process.argv.includes("--check-env");
  if (deployed || checkEnv) loadProductionEnv(dir, load);
  if (checkEnv) return;

  const hostname = "127.0.0.1";
  const port = Number(process.env.PORT || 3000);
  // Server Action redirects fetch their destination. Passenger owns the socket in production.
  process.env.__NEXT_PRIVATE_ORIGIN = deployed ? process.env.SITE_URL : `http://${hostname}:${port}`;
  const app = load("next")({ dev: false, dir, hostname, port });
  await app.prepare();
  const handle = app.getRequestHandler();
  createServer((req, res) => {
    handle(req, res).catch((error) => {
      console.error(error);
      if (res.headersSent) {
        res.destroy();
      } else {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });
  }).listen(port, hostname);
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
