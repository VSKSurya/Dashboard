"""Small standard-library task runner for the repository's static prototypes."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
TRAINING_TRACKER = ROOT / "TeacherTraining"


def serve() -> None:
    """Serve the TeacherTraining prototype at http://localhost:8080."""
    handler = partial(SimpleHTTPRequestHandler, directory=str(TRAINING_TRACKER))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", 8080), handler)
    except OSError as exc:
        raise SystemExit(f"Could not start server on port 8080: {exc}") from exc

    print("TeacherTraining: http://localhost:8080/login.html")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


def test() -> int:
    """Run the TeacherTraining Playwright suite."""
    if not (TRAINING_TRACKER / "node_modules" / "playwright").exists():
        print("Playwright is not installed. Run `npm ci` in TeacherTraining first.", file=sys.stderr)
        return 1
    command = ["npx", "--no-install", "playwright", "test"]
    if os.name == "nt":
        command = ["cmd", "/c", *command]
    result = subprocess.run(
        command,
        cwd=TRAINING_TRACKER,
        check=False,
    )
    return result.returncode


TASKS = {
    "serve": (serve, "Start the local TeacherTraining web server"),
    "test": (test, "Run the TeacherTraining Playwright tests"),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task", nargs="?", choices=(*TASKS, "list"), default="list")
    args = parser.parse_args()

    if args.task == "list":
        print("Available tasks:")
        for name, (_, description) in TASKS.items():
            print(f"  {name:<8} {description}")
        return 0

    task, _ = TASKS[args.task]
    result = task()
    return result if isinstance(result, int) else 0


if __name__ == "__main__":
    raise SystemExit(main())
