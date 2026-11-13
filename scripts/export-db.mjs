// Exports the CMS database as a clean SQLite file and a portable .sql dump.
//   node scripts/export-db.mjs <outDir>
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
const out = path.resolve(process.argv[2] || "db-export");
fs.mkdirSync(out, { recursive: true });

const src = new DatabaseSync(path.join(dataDir, "site.db"));
const dbFile = path.join(out, "site.db");
fs.rmSync(dbFile, { force: true });
src.exec(`VACUUM INTO '${dbFile.replace(/'/g, "''")}'`);

const q = (v) =>
  v === null || v === undefined ? "NULL" : typeof v === "number" || typeof v === "bigint" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const lines = ["-- Four Stars Security CMS database dump", `-- Generated ${new Date().toISOString()}`, "PRAGMA foreign_keys=OFF;", "BEGIN TRANSACTION;"];
const tables = src.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
const counts = {};
for (const t of tables) {
  lines.push(`DROP TABLE IF EXISTS "${t.name}";`, `${t.sql};`);
  const rows = src.prepare(`SELECT * FROM "${t.name}"`).all();
  counts[t.name] = rows.length;
  for (const r of rows) {
    const cols = Object.keys(r);
    lines.push(`INSERT INTO "${t.name}" (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols.map((c) => q(r[c])).join(",")});`);
  }
}
lines.push("COMMIT;");
fs.writeFileSync(path.join(out, "site.sql"), lines.join("\n") + "\n", "utf8");

// Verify the exported file opens and matches
const check = new DatabaseSync(dbFile, { readOnly: true });
const ok = Object.entries(counts).every(([t, n]) => check.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n === n);
console.log(JSON.stringify({ out, ok, counts }, null, 1));
