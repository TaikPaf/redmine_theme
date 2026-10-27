// Builds images/icons.svg from Lucide icons.
// Usage: node src/build-icons.mjs <path to lucide-static/icons>
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = process.argv[2];
if (!iconsDir) {
  console.error('Usage: node src/build-icons.mjs <lucide-static/icons>');
  process.exit(1);
}

const map = JSON.parse(readFileSync(join(root, 'src', 'icon-map.json'), 'utf8'));
const symbols = [];
const missing = [];

for (const [redmineName, lucideName] of Object.entries(map)) {
  const file = join(iconsDir, `${lucideName}.svg`);
  if (!existsSync(file)) {
    missing.push(`${redmineName} -> ${lucideName}`);
    continue;
  }
  const svg = readFileSync(file, 'utf8');
  const body = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'))
    .replace(/\s*\/>/g, '/>')
    .replace(/\n\s*/g, '\n      ')
    .trim();
  symbols.push(
    `    <symbol viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" id="icon--${redmineName}">\n      ${body}\n    </symbol>`
  );
}

const out = `<?xml version="1.0"?>
<!-- Icons from Lucide (https://lucide.dev), ISC License. -->
<svg xmlns="http://www.w3.org/2000/svg" class="icon--sprite">
  <defs>
${symbols.join('\n')}
  </defs>
</svg>
`;
writeFileSync(join(root, 'images', 'icons.svg'), out);
console.log(`${symbols.length} icons written`);
if (missing.length) console.log(`Missing in Lucide: ${missing.join(', ')}`);
