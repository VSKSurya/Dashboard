// A tiny static file server for the project folder. render.mjs and still.mjs start one on a free port
// and stop it when they finish, so there is no separate server step.
// Run it on its own to watch the video live in a browser:  node serve.mjs   (then open http://localhost:8780/)
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf" };

// Returns { url, close }. port 0 = any free port.
export function serve(root = process.cwd(), port = 0) {
  root = path.resolve(root);
  const server = http.createServer(async (req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(root, rel);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" }).end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  return new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(port, "127.0.0.1", () => ok({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { url } = await serve(process.cwd(), +(process.env.PORT || 8780));
  console.log(`serving ${process.cwd()} at ${url}/  (Ctrl+C to stop)`);
}
