import { chromium } from "playwright";
import { executablePath, gpuArgs } from "../chrome.mjs";

const browser = await chromium.launch({ headless: true, executablePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("file:///D:/AI_Dashboard/experiments/ernetdasbhoard.html", { waitUntil: "networkidle" });
const audience = process.argv[2] || "Student";
await page.locator(`[data-audience="${audience}"]`).click();
await page.waitForTimeout(350);
await page.screenshot({ path: `assets/screen-${audience.toLowerCase()}.png`, fullPage: true });
await browser.close();
console.log(`wrote assets/screen-${audience.toLowerCase()}.png (${audience} toggle selected in the real dashboard)`);
