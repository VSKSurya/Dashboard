// Which Chromium to drive. Playwright's own browser if it is installed for this Playwright version;
// otherwise the newest Chromium already in a Playwright cache folder (saves a download).
import { existsSync, readdirSync } from "node:fs";
import { chromium } from "playwright";
import { homedir } from "node:os";
import path from "node:path";

function pick() {
  try { if (existsSync(chromium.executablePath())) return undefined; } catch {}
  const caches = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.platform === "win32" && path.join(process.env.LOCALAPPDATA || path.join(homedir(), "AppData", "Local"), "ms-playwright"),
    process.platform === "darwin" && path.join(homedir(), "Library", "Caches", "ms-playwright"),
    path.join(homedir(), ".cache", "ms-playwright"),
    path.join(process.cwd(), "node_modules", "playwright-core", ".local-browsers"), // PLAYWRIGHT_BROWSERS_PATH=0 installs here
  ].filter((c) => c && existsSync(c));
  const exes = [
    ["chrome-win64", "chrome.exe"], ["chrome-win", "chrome.exe"],
    ["chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"],
    ["chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"],
    ["chrome-linux64", "chrome"], ["chrome-linux", "chrome"],
  ];
  for (const cache of caches) {
    const dirs = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split("-")[1] - +a.split("-")[1]);
    for (const d of dirs) for (const rel of exes) {
      const exe = path.join(cache, d, ...rel);
      if (existsSync(exe)) return exe;
    }
  }
  return undefined; // let Playwright complain with its install hint
}
export const executablePath = pick();
// Mac renders fastest on Metal. Windows and Linux use Chrome's own default (Direct3D 11 on Windows).
export const gpuArgs = [...(process.platform === "darwin" ? ["--use-angle=metal"] : []), "--enable-gpu-rasterization", "--ignore-gpu-blocklist"];
