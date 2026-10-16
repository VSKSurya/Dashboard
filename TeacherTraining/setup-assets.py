#!/usr/bin/env python3
"""Download Bootstrap and jQuery locally, then update index.html only after all downloads succeed."""

from pathlib import Path
import urllib.request
import hashlib

root = Path(__file__).resolve().parent
vendor_dir = root / "assets" / "vendor"
vendor_dir.mkdir(parents=True, exist_ok=True)

assets = [
    (
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
        "bootstrap-5.3.8.min.css",
        100000
    ),
    (
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js",
        "bootstrap-5.3.8.bundle.min.js",
        50000
    ),
    (
        "https://code.jquery.com/jquery-4.0.0.min.js",
        "jquery-4.0.0.min.js",
        50000
    )
]

headers = {
    "User-Agent": "Mozilla/5.0"
}

received = []

for url, name, min_size in assets:
    try:
        print(f"Downloading {name}...")

        request = urllib.request.Request(
            url,
            headers=headers
        )

        with urllib.request.urlopen(
            request,
            timeout=40
        ) as response:
            data = response.read()

        if len(data) < min_size:
            raise ValueError(
                f"Downloaded file is unexpectedly small: {len(data)} bytes"
            )

        first_bytes = data.lstrip().lower()

        if first_bytes.startswith(
            (b"<!doctype html", b"<html")
        ):
            raise ValueError(
                "Server returned HTML instead of the requested asset"
            )

        received.append(
            (url, name, data)
        )

    except Exception as error:
        raise SystemExit(
            f"No index changes made.\n"
            f"Could not fetch {name}: {error}"
        )


index_file = root / "index.html"

if not index_file.exists():
    raise SystemExit(
        f"index.html not found at:\n{index_file}"
    )

page = index_file.read_text(
    encoding="utf-8"
)

for url, name, data in received:

    target = vendor_dir / name

    target.write_bytes(data)

    page = page.replace(
        url,
        "assets/vendor/" + name
    )

    sha256 = hashlib.sha256(data).hexdigest()

    print(
        f"{name}\n"
        f"SHA256: {sha256}\n"
    )


index_file.write_text(
    page,
    encoding="utf-8"
)

print(
    "Bootstrap and jQuery are now local.\n"
    "index.html has been updated.\n"
    "The application can now run without CDN access."
)