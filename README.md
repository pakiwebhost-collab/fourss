# Four Stars Security Services — Website & CMS

Rebuilt website for **4ssecurity.pk** with a built-in content management system.

- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, SQLite (Node’s built-in `node:sqlite`), TipTap editor.
- **No external database or CMS service needed.** All content lives in `data/site.db`; uploads live in `data/uploads/`.

## Run locally

Requires **Node.js 22.13+ (Node 24 recommended)**.

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

Open http://localhost:3000. The admin panel is at http://localhost:3000/admin/.

On the very first start the database is created and filled with all content migrated from the old site
(pages, services, industries, locations, 4 genuine blog posts, team, clients, gallery, FAQs). The first admin
account uses `ADMIN_EMAIL` / `ADMIN_PASSWORD`. If no password is set, a random one is written to
`data/INITIAL_ADMIN_PASSWORD.txt`.

To start over with the original migrated content, stop the server and delete the `data/` folder.

## What the CMS manages

| Section | What you can do |
| --- | --- |
| Homepage | Every homepage section: hero, stats, about, featured services, recruitment, equipment, values, call-to-action |
| Pages & Services | All pages, including services, industries, locations and legal pages: text (rich editor), images, SEO, visibility, URL. Create new service/industry/location pages. |
| Blog Posts | Write, edit, schedule, feature and delete posts; categories, tags, cover images, SEO, draft preview |
| Team | Add/edit/remove members with photo, position, department, bio, phone, email, LinkedIn; reorder; feature on About |
| About Content | Vision, mission points and highlights |
| Clients / Gallery / FAQs | Add, edit, categorise, reorder and remove |
| Media Library | Drag-and-drop uploads; large photos are resized and converted to WebP automatically |
| Inbox | All contact, quote and newsletter submissions; mark read/unread; CSV export |
| Site Settings | Phones, emails, offices, WhatsApp numbers, social links, map, default SEO |
| Users & Account | Change password; admins can add editors/admins |

## Forms & email

Contact, quote and newsletter forms always save to **Admin → Inbox**. To also receive them by email,
set the `SMTP_*` variables (e.g. the mailbox for info@4ssecurity.pk from your hosting provider, or Gmail /
Google Workspace with an app password). The notification address is set in **Site Settings**.

## Deploying

This app needs a host that runs **Node.js** with a **persistent disk** (for `data/`). Good options:

- **VPS** (DigitalOcean, Hetzner, Contabo…): `npm ci && npm run build`, then run `npm start` with PM2 or systemd behind Nginx with HTTPS.
- **Hostinger / cPanel “Setup Node.js App”** where available: point the app root to this folder, startup command `npm start`.

Serverless hosts (e.g. Vercel) are **not** suitable as-is, because the SQLite file and uploads need a writable disk.

Production checklist:

1. Set `SITE_URL`, `SESSION_SECRET` (32+ random characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD` and SMTP values.
2. Optionally set `DATA_DIR` to a folder outside the app so redeploys never touch content.
3. `npm ci && npm run build && npm start` (listens on port 3000; set `PORT` to change).
4. Log in at `/admin/`, change the password, and fill in team positions.
5. **Back up the `data/` folder regularly** — it is the entire CMS content.

Old WordPress URLs are kept (same paths with trailing slashes), and `/services`, `/our-clients`, `/blog`
and `/wp-admin` redirect to their new equivalents. A sitemap is served at `/sitemap.xml`.

## Project layout

```
src/app/(site)/          public website (homepage + catch-all page renderer)
src/app/admin/           CMS (login, dashboard, editors) and server actions
src/app/api/admin/       upload, media list, CSV export (auth required)
src/components/site/     public UI components
src/components/templates page templates (services, team, blog, contact…)
src/components/admin/    CMS UI (rich editor, media picker, schema forms)
src/lib/                 database, auth, content queries, mail, sanitising
src/seed/                migrated content from the old site (first-run seed)
public/images/           images downloaded from the old site
```
