from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

root = Path(__file__).resolve().parent
try:
    server = ThreadingHTTPServer(("localhost", 8080), partial(SimpleHTTPRequestHandler, directory=str(root)))
except OSError:
    raise SystemExit("Port 8080 is busy. Close the previous Training Tracker launcher, then try again.")
print("Training Tracker: http://localhost:8080/login.html")
print("Keep this window open. Press Ctrl+C to stop.")
webbrowser.open("http://localhost:8080/login.html")
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
