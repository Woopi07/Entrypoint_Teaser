// node render_icons.mjs -> out/woopi_icon_grass.png, out/woopi_icon_blue.png (800x800)
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
for (const v of ['grass', 'blue']) {
  const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  await p.goto(pathToFileURL(path.join(here, 'icons.html')).href + '?' + v);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(here, '..', '..', 'out', `woopi_icon_${v}.png`) });
  await p.close();
}
await b.close();
