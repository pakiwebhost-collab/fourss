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
SWC WebAssembly bindings and Google Fonts. The 2 GB Node heap limit is per process, so allow
additional RAM for workers and disk space for dependencies, the build, and retained releases.

### AlmaLinux preflight

Run as the cPanel app user from a terminal after **Update from Remote**. This builds and starts
an isolated copy with a fresh test database. Keep the terminal open while running the smoke checks.

```bash
(
set -euo pipefail
export PATH="/opt/cpanel/ea-nodejs22/bin:$PATH"
node -v
getconf GNU_LIBC_VERSION
command -v git tar flock install
test_dir=$(mktemp -d "$HOME/4ss-preflight.XXXXXXXX")
git -C "$HOME/repositories/fourss" archive HEAD | tar -x -C "$test_dir"
cd "$test_dir"
npm ci --include=dev --include=optional
node -e 'const {DatabaseSync}=require("node:sqlite"); const db=new DatabaseSync(":memory:"); console.log(db.prepare("SELECT sqlite_version() AS version").get()); console.log(require("sharp").versions.sharp)'
DATA_DIR="$test_dir/build-data" SITE_URL=https://4ss.spydermesh.com REQUIRE_EXISTING_DB=1 \
  NODE_OPTIONS=--max-old-space-size=2048 npm run build -- --webpack
test -s .next/BUILD_ID && test ! -e build-data
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
