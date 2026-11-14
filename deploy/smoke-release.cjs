/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CI smoke test. */
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { createHmac, randomBytes } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { DatabaseSync } = require("node:sqlite");
const { setTimeout: delay } = require("node:timers/promises");
const path = require("node:path");

async function smoke() {
  const [release, data, commit] = process.argv.slice(2);
  const origin = "http://127.0.0.1:4313";
  const secret = randomBytes(32).toString("hex");
  const server = spawn(process.execPath, ["app.js"], {
    cwd: release,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, PORT: "4313",
      DATA_DIR: data, SITE_URL: "https://4ss.spydermesh.com",
      SESSION_SECRET: secret, ADMIN_PASSWORD: randomBytes(24).toString("hex") },
    stdio: "inherit",
  });
  const request = (url, options) => fetch(origin + url, {
    redirect: "manual", signal: AbortSignal.timeout(8000), ...options,
  });
  try {
    let home;
    for (let attempt = 0; attempt < 30 && !home && server.exitCode === null; attempt++) {
      home = await request("/").catch(() => undefined);
      if (!home) await delay(500);
    }
    assert.equal(home?.status, 200);
    assert.equal(home.headers.get("x-4ss-release"), commit);
    const html = await home.text();
    const styles = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css[^"]*)"/g)];
    assert.ok(styles.length, "missing stylesheet");
    const css = (await Promise.all(styles.map(async ([, url]) => {
      const response = await request(url);
      assert.equal(response.status, 200);
      return response.text();
    }))).join("");
    assert.match(css, /\.text-gold\s*\{/);
    assert.match(css, /\.flex\s*\{/);
    const optimized = await request("/_next/image/?url=%2Fbrand%2Flogo-dark.webp&w=256&q=75", {
      headers: { Accept: "image/webp" },
    });
    assert.equal(optimized.status, 200);
    assert.match(optimized.headers.get("content-type"), /^image\//);
    assert.equal((await request("/admin/")).status, 307);
    assert.equal((await request("/admin/login/")).status, 200);
    const db = new DatabaseSync(path.join(data, "site.db"), { readOnly: true });
    try {
      const { id } = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
      const payload = Buffer.from(JSON.stringify({ uid: id, exp: Date.now() + 60000 })).toString("base64url");
      const mac = createHmac("sha256", secret).update(payload).digest("base64url");
      const headers = { Cookie: `fss_session=${payload}.${mac}` };
      assert.equal((await request("/admin/posts/", { headers })).status, 200);
      const form = new FormData();
      form.set("files", new Blob([readFileSync(path.join(release, "public/brand/logo-dark.webp"))],
        { type: "image/webp" }), "release-test.webp");
      const upload = await request("/api/admin/upload/", { method: "POST", headers, body: form });
      assert.equal(upload.status, 200);
      const { files, errors } = await upload.json();
      assert.deepEqual(errors, []);
      assert.equal(files.length, 1);
      assert.equal((await request(files[0].url)).status, 200);
      assert.ok(db.prepare("SELECT id FROM media WHERE url = ?").get(files[0].url));
      assert.equal(db.prepare("PRAGMA quick_check").get().quick_check, "ok");
    } finally {
      db.close();
    }
    console.log("Packaged runtime passed release, CSS, image, admin session, upload and SQLite checks.");
  } finally {
    server.kill();
  }
}

smoke().catch(error => { console.error(error); process.exitCode = 1; });
