// Screenshot a real page for use in a step.
//   node shoot.mjs <file.html | http://url> <assets/out.png> [width] [height]
// A local file is served over HTTP from its own folder (so its scripts and modules load), then captured at 2x.
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import path from "node:path";
import { executablePath } from "./chrome.mjs";
import { serve } from "./serve.mjs";

const [src, out, w = 1440, h = 900] = process.argv.slice(2);
if (!src || !out) { console.log("usage: node shoot.mjs <file.html|url> <out.png> [width] [height]"); process.exit(1); }
let url = src, srv;
if (existsSync(src)) { srv = await serve(path.dirname(path.resolve(src))); url = `${srv.url}/${encodeURIComponent(path.basename(src))}`; }
const b = await chromium.launch({ executablePath });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
p.on("pageerror", (e) => console.log("pageerror:", e.message));
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(1200); // let charts and fonts settle
await p.screenshot({ path: out, fullPage: true });
await b.close();
srv?.close();
console.log("wrote", out);
