import { chromium } from "playwright";
import { executablePath, gpuArgs } from "../chrome.mjs";

const browser = await chromium.launch({ headless: true, executablePath, args: gpuArgs });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("file:///D:/AI_Dashboard/experiments/ernetdasbhoard.html", { waitUntil: "networkidle" });
const action = process.argv[2];
if (action === "phase") {
  await page.locator(".phase-card").nth(2).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: "assets/screen-phase.png", fullPage: true });
  console.log("wrote assets/screen-phase.png (Phase 3 selected in the real dashboard)");
} else if (action === "location") {
  for (let depth = 0; depth < 3; depth++) {
    await page.locator("#location-rows .location-name-button").first().click();
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: "assets/screen-location.png", fullPage: true });
  console.log("wrote assets/screen-location.png (drilled to school level in the real dashboard)");
} else {
  throw new Error("Pass phase or location");
}
await browser.close();
