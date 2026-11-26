// node render.mjs -> out/woopi_banner_grass.png, out/woopi_banner_blue.png (+ _safe-area previews)
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', '..', 'out');
const b = await chromium.launch();
for (const v of ['grass', 'blue']) for (const g of ['', '&guide']) {
  const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
  await p.goto(pathToFileURL(path.join(here, 'banners.html')).href + '?' + v + g);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(out, `woopi_banner_${v}${g ? '_safe-area' : ''}.png`) });
  await p.close();
}
await b.close();
