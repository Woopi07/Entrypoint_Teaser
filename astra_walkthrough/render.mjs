// Renders teaser.html frame-by-frame with headless Chromium.
// Usage: node render.mjs <width> <height> <outDir> [fps=30] [only=t1,t2,...]   (length comes from timeline.js)
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/node-tools/node_modules/playwright'); }

const [w, h, outDir, fpsArg = '30', only] = process.argv.slice(2);
const fps = +fpsArg;
const here = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(outDir, { recursive: true });

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(pathToFileURL(path.join(here, 'video.html')).href + '?render' + (process.env.RENDER_QUERY || ''));
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));

const secs = await page.evaluate(() => window.TL.total);
// EVENTS_OUT=file writes the pointer-click times, so audio.py can add click sounds
if (process.env.EVENTS_OUT) {
  const ev = await page.evaluate(() => ({ clicks: window.CLICKS, pops: window.POPS, confs: window.CONFS, swaps: window.SWAPS, words: window.WORDS, xp: window.XP }));
  (await import('fs')).writeFileSync(process.env.EVENTS_OUT, JSON.stringify(ev));
}
const times = only ? only.split(',').map(Number) : [...Array(Math.round(fps * secs)).keys()].map(i => i / fps);
// FRAMES=a-b re-renders only that frame range (to patch one scene)
const [fa, fb] = (process.env.FRAMES || `0-${times.length - 1}`).split('-').map(Number);
for (let i = fa; i <= Math.min(fb, times.length - 1); i++) {
  await page.evaluate(t => window.render(t), times[i]);
  const name = only ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.jpg`;
  await page.screenshot({ path: path.join(outDir, name), type: only ? 'png' : 'jpeg', quality: only ? undefined : 93 });
  if (i % 150 === 0) console.log(`${w}x${h} frame ${i}/${times.length}`);
}
await browser.close();
