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

## Option B — cPanel / Hostinger "Node.js App"

1. In the hosting panel, create a Node.js application: Node version **22 or 24**, application root = the
   uploaded folder, startup file `node_modules/next/dist/bin/next` with argument `start`
   (or the panel's "npm start" option).
2. Add the environment variables from `.env.example` in the panel (at minimum `SITE_URL`,
   `SESSION_SECRET`, `SMTP_*`). Set `DATA_DIR` to a folder **outside** `public_html` if possible.
3. Run `npm ci` and `npm run build` from the panel's terminal / "Run NPM install" button.
4. Restart the app and point the domain to it.

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
