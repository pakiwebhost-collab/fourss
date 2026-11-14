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

## Option B — Manual GitHub Actions deployment to cPanel Passenger

Production uses the cPanel account `websitemake4u`, the Git checkout at
`/home/websitemake4u/repositories/fourss`, and the Passenger app at
`/home/websitemake4u/apps/fourss` with EA Node.js 22.23.4 and `app.js`.
The existing `.env.production`, SQLite DB and uploads keep their current locations.
Only GitHub Actions installs npm dependencies and builds the application.

Push to `main` and wait for **Build cPanel release** to publish all three signed assets
for the commit. In **Actions → Deploy to cPanel → Run workflow**, select `main` and run
with **Verify only** unchecked. That is the only deployment action during normal updates.
The dispatched workflow sends its exact commit SHA to the account's restricted SSH command.
The server checks that SHA against GitHub `main`, then rechecks immediately before activation.
A newer push invalidates an older queued deployment. The cPanel-managed checkout is left
as-is. Its recorded last deployment describes its own hook history, while the Actions log
and SHA response describe the live release.

### One-time signing setup

Generate a dedicated RSA signing key off-server, in a private directory outside the repository.
Keep an offline backup of the private key. Verify its public fingerprint over a trusted channel.

```bash
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out fourss-release-signing.pem
openssl pkey -in fourss-release-signing.pem -pubout -out release-signing.pub.pem
openssl pkey -pubin -in release-signing.pub.pem -outform DER | openssl dgst -sha256
```

1. In GitHub **Settings → Environments**, create `cpanel-release-signing`. Restrict its deployment
   branches to `main`. Store the full private PEM as environment secret `FOURSS_RELEASE_SIGNING_KEY`.
   Protect `main` and require review for changes to the workflow, packaging, and cPanel scripts.
   The publish job signs on a separate runner and never runs build dependencies. GitHub
   Releases contains public assets. Keep every private input outside the build container.
   Enable immutable releases if available.
2. Later, as the cPanel account, install only the public PEM from the trusted copy. No root or
   GitHub token is needed on the VPS. Confirm the key fingerprint after uploading.

   ```bash
   install -d -m 700 "$HOME/.config/fourss"
   install -m 600 /path/to/trusted/release-signing.pub.pem "$HOME/.config/fourss/release-signing.pub.pem"
   openssl pkey -pubin -in "$HOME/.config/fourss/release-signing.pub.pem" -outform DER | openssl dgst -sha256
   command -v curl openssl python3 timeout flock realpath stat awk
   /opt/cpanel/ea-nodejs22/bin/node -v
   getconf GNU_LIBC_VERSION
   uname -m
   ```

If rotating keys, coordinate the publisher secret and the separately provisioned public key.
Previously installed releases can still be rolled back locally. New activations require a
manifest signed with the currently trusted key. For a failed publish, inspect any draft for
that exact SHA and remove an incomplete draft before rerunning. A published immutable release
is retained. Push a new approved commit when rebuilding a published artifact.

### One-time SSH setup and approval sequence

1. Approve and push the reviewed CI/workflow changes. Confirm the exact commit's hosted Linux
   build and unpacked smoke test pass and the protected publish job signs the three assets.
   Publication does not contact the VPS. Keep the trusted release-signing public key from the
   previous setup pinned on the account.
2. Generate a dedicated Ed25519 deployment SSH key on a trusted workstation outside this repo.
   Put the automation private key in GitHub **Settings → Environments → cpanel-production** as
   `FOURSS_DEPLOY_SSH_KEY`. Restrict the environment to the branch `main` and protect workflow
   edits through normal branch review. Use an environment secret, separate from the signing key.
   Add environment variables `FOURSS_SSH_HOST`, `FOURSS_SSH_PORT` (default `22`), and
   `FOURSS_SSH_KNOWN_HOSTS`. Obtain and verify the server host key through an existing trusted
   login or the hosting provider. For a nonstandard port use `[hostname]:port` in the pinned
   `known_hosts` entry. The workflow requires key-only authentication and strict host checking.

   ```bash
   ssh-keygen -t ed25519 -f ./fourss-actions -C fourss-actions
   ```

   Generate the automation key without a passphrase for this noninteractive job. Keep the
   private file in a secure location until it has been stored as the environment secret.
3. After approval for account-level setup, use cPanel File Manager to upload the reviewed
   `deploy/cpanel-deploy.sh` and `deploy/verify-release.py` into
   `/home/websitemake4u/.config/fourss`. Keep that directory private and outside the Git
   checkout, document root and releases. Future changes to these two trusted files require
   a reviewed account-level update. Routine application deployments use the installed copies.
   With hidden files visible, append exactly one restricted key line to
   `/home/websitemake4u/.ssh/authorized_keys`, preserving the existing entries. Use owner-only
   permissions on the directory and file. Remove any unrestricted duplicate of this key.
   The cPanel key authorization screen must not create a second unrestricted entry.

   ```text
   restrict,command="/usr/bin/env -i HOME=/home/websitemake4u PATH=/usr/bin:/bin SSH_ORIGINAL_COMMAND=\"$SSH_ORIGINAL_COMMAND\" /bin/bash /home/websitemake4u/.config/fourss/cpanel-deploy.sh --ssh-verify-only" ssh-ed25519 AAAA... fourss-actions
   ```

4. Run the Actions deployment with **Verify only** checked. Confirm it reaches the account
   under the existing jail and verifies the signed artifact. Confirm the test key rejects a
   deployment request, arbitrary commands and forwarding. Use disposable checks below to
   validate Passenger activation and rollback. If the runner cannot reach the current SSH
   endpoint, leave the SSH and firewall settings as they are and investigate the alternative
   below.
5. After a separate production approval, edit that single key entry to replace
   `--ssh-verify-only` with `--ssh`. Use **Deploy to cPanel → Run workflow** on `main`.
   A successful job reports the verified serving SHA. A failed job carries the remote error
   and rollback outcome. If the SSH connection is interrupted, check the serving SHA and
   the recovery record before retrying. To revoke this capability, remove that one key entry
   and delete the environment secret.

The forced command accepts only a verification or deployment request with a full SHA.
It passes the requested command as quoted data in a clean environment. The installer
prefers Git from `/usr/local/cpanel/3rdparty/lib/path-bin` in its fixed SSH PATH and clears
inherited Git settings for the outbound HTTPS lookup.
The limited key can still request activation of a valid signed current-main release once enabled.
Anyone who can edit the trusted scripts or deploy from the same account has the account's
existing privileges. Preserve Jailed Shell and use a fixed host key. If an API fallback is
needed, assess cPanel UAPI Git synchronization and `VersionControlDeployment::create` on the
disposable repository. That API queues the hook, so polling and a matching HTTPS release
check are needed to establish the outcome. Confirm exact-SHA synchronization and token
scope on cPanel 126 first. A full-account API token is broader than the restricted SSH key.

### Disposable cPanel Git task

Keep the production checkout and hook out of this test. After separately approved publication,
wait for the green Actions run and the three assets on release `cpanel-<full-sha>`. Reuse
`$HOME/repositories/fourss-socket-probe` or create an empty disposable Git Version Control
repository there. Copy `cpanel-deploy.sh` and `verify-release.py` from the reviewed revision into
that disposable repository. Its test `.cpanel.yml` should contain the following, with the full
published SHA substituted.

```yaml
---
deployment:
  tasks:
    - /bin/bash /home/websitemake4u/repositories/fourss-socket-probe/cpanel-deploy.sh --verify-only FULL_PUBLISHED_SHA
```

Commit those three files in the disposable checkout:

```bash
(
set -euo pipefail
cd "$HOME/repositories/fourss-socket-probe"
test "$(git rev-parse --show-toplevel)" = "$PWD"
git add -- .cpanel.yml cpanel-deploy.sh verify-release.py
git -c user.name='4SS Release Probe' -c user.email='release-probe@example.invalid' \
  commit -m 'Verify a signed cPanel release without activation'
git status --short
)
```

In cPanel **Manage → Pull or Deploy**,
confirm the disposable path, then click **Deploy HEAD Commit**. Expect the exact SHA and
`Activation skipped` in the completed task log at `~/.cpanel/logs/vc_*_git_deploy.log`.
This mode uses a private directory under `/tmp` and inspects archive metadata and file bytes.
It executes no downloaded code and never reads the live app or DB.
Repeat in the disposable repository with an unpublished full SHA and confirm a nonzero task
result. Time the successful task to establish the cPanel job budget. The download, unpack and
health deadlines are per phase. A slow host may need a shorter release-check budget or faster
artifact access before live cutover.

The verification-only task proves download, signature verification, extraction and the
presence of Linux x64 Sharp and libvips files. The CI smoke test and separate Passenger
staging app exercise native loading.
To validate switching, rollback, and the Passenger SHA response before live cutover, use a
separate disposable Passenger registration and a copy of the deploy script pointed only at
that registration and its fixture files. Adapt the disposable launcher's production environment
check to the fixture domain and data path, and use a separately signed test artifact whose
launcher accepts that fixture. Exercise a successful switch and force the candidate health
check to fail. Confirm recovery of the prior launcher and symlink, and that the disposable
SQLite file and uploads remain outside the releases. Keep the production paths out of both
tests.

### Activation and rollback after validation and approval

The Actions workflow invokes the trusted installer through the restricted SSH key. The installer
downloads and verifies the signed manifest before fetching the archive. It checks the digest
and runtime layout, rejects escaping paths and links, and leaves the existing release active
until candidate validation succeeds. It replaces the launcher atomically only when its
verified bytes differ. Passenger health must return the selected SHA over HTTPS. For the first
rollback to the legacy release, the hook checks the restored pointer and launcher, then
requires a cache-bypassed homepage response without the candidate SHA header. The HTML must
refer to both a stylesheet and a script in the restored release, and their served SHA-256
digests must match the restored files. If those checks fail, the hook retains the recovery
record and reports the rollback as unconfirmed. The legacy release cannot attest its Git SHA.

A failed download or validation leaves the current release untouched. A failure after
switching can briefly affect traffic while the hook restores the previous launcher and
release, signals Passenger, and checks recovery. Inspect the final cPanel task log. If the
task is forcibly killed, inspect `apps/fourss/tmp/deploy-recovery` before retrying. Recover
as the app user while holding the same deployment lock:

```bash
(
set -euo pipefail
app="$HOME/apps/fourss"
recovery="$app/tmp/deploy-recovery"
exec 9>"$app/tmp/deploy.lock"
flock -n 9
previous=$(realpath -e -- "$(cat "$recovery/previous-release")")
[[ "$previous" == "$app/releases/"* && -s "$previous/.next/BUILD_ID" ]]
work=$(mktemp -d "$app/tmp/restore.XXXXXXXX")
trap 'rm -rf -- "$work"' EXIT
cp -p -- "$recovery/app.js" "$work/app.js"
ln -s -- "$previous" "$work/current"
mv -Tf -- "$work/app.js" "$app/app.js"
mv -Tf -- "$work/current" "$app/current"
touch "$app/tmp/restart.txt"
echo "Restored $previous. Verify Passenger before removing $recovery."
)
```

Verify the restored site with a cache-bypassed request and compare the response SHA when the
previous release supports it. For the legacy release, use `verify-release.py legacy-assets
<saved-homepage.html> <previous-release-directory>` to obtain the expected URLs and digests.
Compare them with fresh HTTPS responses before clearing the recovery record. Retain at least one
known-good release on the VPS and its artifact on GitHub. For a planned rollback, use the same
lock, point `current` at the retained release, restore its compatible launcher if needed, and
request a restart.

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
