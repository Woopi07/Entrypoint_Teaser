// Renders scene.html frame by frame (WebGL via SwiftShader) through a local static server.
// Usage: node render.mjs <outDir> [fps=30] [only=t1,t2,...]    FRAMES=a-b re-renders a range; EVENTS_OUT=file writes sound cues
import { createRequire } from 'module';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir, fpsArg = '30', only] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = path.normalize(path.join(here, decodeURIComponent(req.url.split('?')[0])));
  if (!p.startsWith(here)) { res.writeHead(403); return res.end(); }
  try { res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }
  catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const port = server.address().port;
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', (e) => console.log('PAGEERR', e.message));
await p.goto(`http://127.0.0.1:${port}/scene.html?render`);
await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const total = await p.evaluate(() => window.TL.total), fps = +fpsArg;
if (process.env.EVENTS_OUT) writeFileSync(process.env.EVENTS_OUT, JSON.stringify(await p.evaluate(() => ({ clicks: window.CLICKS, pops: window.POPS, confs: window.CONFS, swaps: window.SWAPS, words: window.WORDS, xp: window.XP }))));
const times = only ? only.split(',').map(Number) : [...Array(Math.round(fps * total)).keys()].map((i) => i / fps);
const [fa, fb] = (process.env.FRAMES || `0-${times.length - 1}`).split('-').map(Number);
const t0 = Date.now();
for (let i = fa; i <= Math.min(fb, times.length - 1); i++) {
  await p.evaluate((t) => window.render(t), times[i]);
  await p.screenshot({ path: path.join(outDir, only ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.jpg`), type: only ? 'png' : 'jpeg', quality: only ? undefined : 92 });
  if (i % 60 === 0) console.log('frame', i, '/', times.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await b.close(); server.close();
