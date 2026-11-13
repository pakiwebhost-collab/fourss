# Deploying 4ssecurity.pk

This package contains the full website and CMS source code plus the ready-to-use database
(`data/site.db`) with all content migrated from the old site.

**Requirements:** a server or hosting plan that runs **Node.js 22.13+ (Node 24 recommended)** and keeps files
on disk between restarts (`data/` must persist). Shared PHP-only hosting and Vercel will not work.

---

## Option A — VPS (Ubuntu), recommended

Works on DigitalOcean, Hetzner, Contabo, AWS Lightsail and similar (1 GB RAM is enough).

1. Upload and unzip the package to the server, e.g. `/var/www/4ss-website`.
2. Run the setup script twice from that folder:
   ```bash
   cd /var/www/4ss-website
   bash deploy/setup-ubuntu.sh      # 1st run: installs Node/Nginx/PM2, creates .env.production, then stops
   nano .env.production             # set ADMIN_EMAIL, SMTP_* (SESSION_SECRET and DATA_DIR are pre-filled)
   bash deploy/setup-ubuntu.sh      # 2nd run: builds, starts the site with PM2, configures Nginx
   ```
   The database is copied to `/var/lib/4ss-data` so future code updates never overwrite content.
3. Point the domain's DNS **A record** for `4ssecurity.pk` and `www` to the server IP.
4. Enable HTTPS:
   ```bash
   sudo certbot --nginx -d 4ssecurity.pk -d www.4ssecurity.pk
   ```
5. Schedule daily backups:
   ```bash
   crontab -e
   # add:  0 3 * * * DATA_DIR=/var/lib/4ss-data bash /var/www/4ss-website/deploy/backup.sh
   ```

**Updating the site code later:** upload the new files (keep `.env.production`), then
`npm ci && npm run build && pm2 reload 4ss-website`.

---

## Option B — Manual cPanel Git deployment with Passenger

For the 4SS demo, register `4ss.spydermesh.com` at `/` in Application Manager, using
`apps/fourss` as the application path, the production environment, and Passenger's default
`app.js` startup file. Confirm Passenger uses `/opt/cpanel/ea-nodejs22/bin/node` and runs as
`websitemake4u`. Use `/home/websitemake4u/repositories/fourss` for the separate cPanel Git checkout.

The existing `/home/websitemake4u/apps/fourss/.env.production` must be readable by the app user.
Confirm the effective `SITE_URL=https://4ss.spydermesh.com`, `DATA_DIR=/home/websitemake4u/4ss-data`,
and `SESSION_SECRET` (at least 32 characters). Keep secure cookies enabled. Passenger-injected
environment variables take precedence over `.env.production`. The existing SQLite database,
its directory, and the uploads directory must be writable by the app user for WAL and CMS uploads.
Keep the environment, SQLite database, and uploads outside the Git checkout and document root.

After the desired commit reaches GitHub, use **Git Version Control → Manage → Pull or Deploy →
Update from Remote**. Verify the expected HEAD and run the isolated server preflight below before
clicking **Deploy HEAD Commit**. The deployment installs locked dependencies and builds with
Webpack in a fresh release. It links the production environment after the build succeeds, checks
its effective settings, switches `current`, then touches `tmp/restart.txt`. Builds may download
SWC WebAssembly bindings and Google Fonts. The shared `deploy/cpanel-build.sh` logs the inherited
address-space limits and raises only the build subshell's soft limit to the inherited hard limit.
It uses Node 22's `--disable-wasm-trap-handler`, limits glibc malloc arenas and native CSS
Rayon threads to two each, and lets Webpack process up to four modules at a time. Next.js keeps
the server, edge, and client compilations in separate, sequential workers and uses one page-data
worker. The 2 GB heap setting applies to the main process and Webpack compiler worker. Next.js
removes it from isolated page-data workers.

### AlmaLinux preflight

Run as the cPanel app user from a terminal after **Update from Remote**. The subshell enforces the
same 8 GiB soft and hard address-space limits as cPanel. It builds and starts an isolated copy with
a fresh test database. Keep the terminal open while running the smoke checks.

```bash
(
set -euo pipefail
export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"
test "$(node -v)" = v22.23.4
test "$(getconf GNU_LIBC_VERSION)" = 'glibc 2.28'
command -v git tar flock install
ulimit -S -H -v 8388608
test_dir=$(mktemp -d "$HOME/4ss-preflight.XXXXXXXX")
git -C "$HOME/repositories/fourss" archive HEAD | tar -x -C "$test_dir"
cd "$test_dir"
npm ci --include=dev --include=optional
node -e 'const {DatabaseSync}=require("node:sqlite"); const db=new DatabaseSync(":memory:"); console.log(db.prepare("SELECT sqlite_version() AS version").get()); console.log(require("sharp").versions.sharp)'
DEBUG=next:build:webpack-build bash deploy/cpanel-build.sh 2>&1 | tee build.log
grep -F 'next-swc build: wasm build' build.log
DATA_DIR="$test_dir/test-data" SITE_URL=https://4ss.spydermesh.com REQUIRE_EXISTING_DB=0 \
  PORT=4313 node app.js
)
```

From a second terminal run `curl -fsS http://127.0.0.1:4313/ -o /dev/null`,
`curl -fsS http://127.0.0.1:4313/admin/login/ -o /dev/null`, and
`curl -fsS http://127.0.0.1:4313/sitemap.xml | grep -F 'https://4ss.spydermesh.com/'`.
Stop the test process with Ctrl+C. Check the actual Passenger integration separately using an
isolated staging registration where available. Before a live activation, take a consistent SQLite
backup and retain the prior app release. After activation, check Passenger logs, HTTPS redirects,
admin login, and static assets. Next.js fetches Server Action redirect responses through the
demo origin under Passenger, so confirm the app user can reach that HTTPS origin from the VPS.
On subsequent releases, rollback consists of repointing `current`
to the retained prior release and touching `tmp/restart.txt`. For the first migration, also keep
a copy of the previous startup file and retain the original app directory contents. Older releases
remain on disk for rollback. Remove unused releases after confirming they are no longer serving.

If the build still aborts, capture the last Next.js phase and the limits reported by the failing
execution context. In the cPanel terminal, run `ulimit -Sa; ulimit -Ha` and, if readable,
`cat /proc/$$/limits`. During compilation, read `VmPeak`, `VmSize`, `VmRSS`, and `Threads` from
`/proc/<compiler-pid>/status`, and inspect `/proc/<compiler-pid>/maps` if available. V8's heap
statistics cover only part of the virtual address space. The terminal and Git deployment task can
inherit different limits.
A hard address-space cap, a data-segment limit, or an account memory limit can prevent V8 from
growing the heap well below its configured ceiling. WHM `maxmem` and the Node heap setting alone
do not establish the worker's available memory. If the terminal preflight succeeds but the Git
task fails, run the same checked-out deployment script as the app user from the working terminal
context. If both contexts fail under the cap, build in a clean AlmaLinux 8/GLIBC 2.28 environment
with the same architecture and Node version. Stage the tested release on the VPS under the Git
commit SHA, then manually activate it with the same `current` symlink and Passenger restart. Keep
production secrets and data outside the artifact. To retain **Deploy HEAD Commit** with off-server
builds, the deploy hook would need an explicit artifact verification and activation step in place
of the local compilation. Windows build output is unsuitable for that transfer.

---

## The database

- `data/site.db` is a SQLite database. It holds all pages, blog posts, team, clients, gallery, FAQs, settings,
  users and form submissions. Uploaded images go in `data/uploads/`.
- The separate database package also includes `site.sql`, a plain-SQL dump of the same data, which you can open
  or import with any SQLite tool (e.g. DB Browser for SQLite).
- **Restore from a backup:** stop the site, replace `site.db` (and `uploads/`), start the site.
- **Start fresh:** delete `site.db`; on the next start the site recreates it with the original migrated content.

## First login

Go to `https://4ssecurity.pk/admin/`.

- If you use the bundled database, the admin account is the one already in it: the email and password
  are those set in the developer's local `.env.local` file. **Change the password immediately**
  (Admin → Users & Account).
- If you deleted `site.db` to start fresh, the admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
  in your environment.

## After launch checklist

- [ ] Change the admin password and add accounts for other editors
- [ ] Fill in team member positions (Admin → Team)
- [ ] Review the FAQ, Privacy Policy and Terms pages
- [ ] Send a test message from the Contact page and confirm the email arrives
- [ ] Submit `https://4ssecurity.pk/sitemap.xml` in Google Search Console
- [ ] Take the old WordPress site offline (it contains injected spam posts)
