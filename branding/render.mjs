// node render.mjs  -> writes woopi_icon.png (800x800), woopi_banner.png (2560x1440), and preview images
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(here, '..', 'out');
const b = await chromium.launch();
for (const [q, w, h, name] of [['icon', 800, 800, 'woopi_icon.png'], ['banner', 2560, 1440, 'woopi_banner.png'], ['banner&guide', 2560, 1440, 'woopi_banner_safe-area.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(here, 'brand.html')).href + '?' + q);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(out, name) });
  await p.close();
}
await b.close();
