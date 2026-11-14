"""Validate the signed release metadata and safely unpack a verified archive."""
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tarfile

REPO = "pakiwebhost-collab/fourss"
ARCHIVE = "fourss-linux-x64.tar.gz"
MAX_ARCHIVE = 256 * 1024 ** 2
MAX_EXPANDED = 1024 ** 3
ROOT_FILES = {"app.js", "package.json", "next.config.mjs"}
ROOT_DIRS = {".next", "public", "node_modules"}
ASSET_PATH = re.compile(r"/_next/static/[A-Za-z0-9_/-]+(?:\.[A-Za-z0-9_-]+)*\.(?:css|js)")


def manifest(path, commit):
    if not re.fullmatch(r"[0-9a-f]{40}", commit) or os.path.getsize(path) > 4096:
        raise ValueError("invalid commit or manifest length")
    with open(path, encoding="utf-8") as source:
        data = json.load(source)
    expected = {
        "version": 1, "repository": REPO, "commit": commit,
        "target": "linux-x64-glibc-2.28", "node": "22.23.4", "archive": ARCHIVE,
    }
    if not isinstance(data, dict) or set(data) != set(expected) | {"bytes", "sha256"}:
        raise ValueError("unexpected manifest fields")
    if any(data[key] != value for key, value in expected.items()):
        raise ValueError("manifest commit, repository or target mismatch")
    if type(data["bytes"]) is not int or not 0 < data["bytes"] <= MAX_ARCHIVE:
        raise ValueError("invalid archive size")
    if not isinstance(data["sha256"], str) or not re.fullmatch(r"[0-9a-f]{64}", data["sha256"]):
        raise ValueError("invalid archive digest")
    return data


def unpack(archive, destination):
    seen = set()
    expanded = 0
    if os.listdir(destination):
        raise ValueError("extraction directory must be empty")
    with tarfile.open(archive, "r|gz") as source:
        for entry in source:
            parts = entry.name.split("/")
            if (len(seen) >= 100000 or entry.name in seen or
                    any(part in ("", ".", "..") or "\\" in part or
                        ":" in part or any(ord(c) < 32 for c in part) for part in parts) or
                    not (entry.isfile() or entry.isdir()) or
                    entry.issparse() or entry.size < 0 or
                    not (parts[0] in ROOT_DIRS or
                         len(parts) == 1 and parts[0] in ROOT_FILES and entry.isfile())):
                raise ValueError("unsafe or unexpected archive entry: {!r}".format(entry.name))
            if (any(re.match(r"^\.env(?:\.|$)|^\.(?:npmrc|git)$|^session\.key$|"
                             r"^INITIAL_ADMIN_PASSWORD\.txt$|.*\.(?:sqlite3?|db)(?:-(?:wal|shm|journal))?$",
                             part, re.IGNORECASE) for part in parts) or
                    parts[:2] in [["public", "uploads"], [".next", "cache"], [".next", "dev"]]):
                raise ValueError("forbidden archive entry: {!r}".format(entry.name))
            expanded += entry.size
            if expanded > MAX_EXPANDED:
                raise ValueError("expanded archive exceeds size limit")
            seen.add(entry.name)
            target = os.path.join(destination, *parts)
            if entry.isdir():
                os.makedirs(target, mode=0o700, exist_ok=True)
            else:
                os.makedirs(os.path.dirname(target), mode=0o700, exist_ok=True)
                with source.extractfile(entry) as content, open(target, "xb") as output:
                    shutil.copyfileobj(content, output)
                os.chmod(target, 0o700 if entry.mode & 0o111 else 0o600)


def check_tree(destination, commit):
    for name in sorted(ROOT_FILES | {
        "public/brand/logo-dark.webp", ".next/BUILD_ID", ".next/routes-manifest.json",
        "node_modules/next/package.json", "node_modules/sharp/package.json",
    }):
        if not os.path.isfile(os.path.join(destination, name)):
            raise ValueError("missing runtime file: " + name)
    if not os.path.isdir(os.path.join(destination, ".next", "static")):
        raise ValueError("missing Next.js static assets")
    with open(os.path.join(destination, ".next", "BUILD_ID"), encoding="utf-8") as source:
        if source.read().strip() != commit:
            raise ValueError("Next.js BUILD_ID does not match commit")
    with open(os.path.join(destination, ".next", "routes-manifest.json"), encoding="utf-8") as source:
        routes = json.load(source)
    if not any(
        rule["source"] == "/" and {"key": "X-4SS-Release", "value": commit} in rule["headers"]
        for rule in routes.get("headers", [])
    ):
        raise ValueError("release health header does not match commit")
    for pattern in ("@img/sharp-linux-x64/lib/*.node", "@img/sharp-libvips-linux-x64/lib/libvips-cpp.so.*"):
        binaries = list((Path(destination) / "node_modules").glob(pattern))
        if len(binaries) != 1:
            raise ValueError("missing or ambiguous Linux Sharp dependency: " + pattern)
        with binaries[0].open("rb") as binary:
            header = binary.read(20)
        if len(header) != 20 or header[:6] != b"\x7fELF\x02\x01" or header[18:20] != b"\x3e\x00":
            raise ValueError("expected Linux x64 ELF: " + pattern)


def legacy_assets(html, release):
    """Match real references in Passenger's HTML to files of the restored release."""
    assets = {}

    class References(HTMLParser):
        def handle_starttag(self, tag, attributes):
            attrs = dict(attributes)
            if tag == "script":
                url = attrs.get("src")
            elif tag == "link" and attrs.get("rel") == "stylesheet":
                url = attrs.get("href")
            else:
                return
            if not url or not ASSET_PATH.fullmatch(url):
                return
            relative = url[len("/_next/"):]
            file = os.path.join(release, ".next", relative)
            if os.path.isfile(file):
                assets.setdefault(os.path.splitext(url)[1], (url, file))

    with open(html, encoding="utf-8") as body:
        References().feed(body.read(4 * 1024 ** 2))
    if set(assets) != {".css", ".js"}:
        raise ValueError("homepage does not reference restored release CSS and JavaScript")
    for url, file in assets.values():
        with open(file, "rb") as source:
            print(url, hashlib.sha256(source.read()).hexdigest())


if __name__ == "__main__":
    try:
        if len(sys.argv) == 4 and sys.argv[1] == "legacy-assets":
            legacy_assets(*sys.argv[2:])
            sys.exit(0)
        action, path, commit = sys.argv[1:4]
        data = manifest(path, commit)
        if action == "size" and len(sys.argv) == 4:
            print(data["bytes"])
        elif action == "extract" and len(sys.argv) == 6:
            archive, destination = sys.argv[4:]
            if os.path.getsize(archive) != data["bytes"]:
                raise ValueError("archive size mismatch")
            digest = hashlib.sha256()
            with open(archive, "rb") as source:
                for chunk in iter(lambda: source.read(1024 ** 2), b""):
                    digest.update(chunk)
            if digest.hexdigest() != data["sha256"]:
                raise ValueError("archive SHA-256 mismatch")
            unpack(archive, destination)
            check_tree(destination, commit)
        else:
            raise ValueError("invalid verifier invocation")
    except (OSError, ValueError, TypeError, KeyError, tarfile.TarError) as error:
        sys.exit("Release verification failed: {}".format(error))
