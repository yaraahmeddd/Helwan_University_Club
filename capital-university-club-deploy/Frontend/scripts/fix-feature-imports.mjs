/**
 * Fix relative imports in features/ and shared/ to use @/ alias
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src');

const ROOT_IMPORTS = [
  'components',
  'hooks',
  'services',
  'lib',
  'utils',
  'context',
  'types',
  'config',
  'data',
  'features',
  'shared',
  'i18n',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const mod of ROOT_IMPORTS) {
    const re = new RegExp(`from ['"](\\.\\./)+${mod}(/[^'"]*)?['"]`, 'g');
    const next = content.replace(re, (_match, _dots, sub = '') => {
      changed = true;
      return `from '@/${mod}${sub || ''}'`;
    });
    content = next;
  }

  // Fix same-folder imports in public pages
  content = content.replace(
    /from ['"]\.\/ReservationPage\.js['"]/g,
    "from './ReservationPage'",
  );

  // staff dashboard css
  if (content.includes("./staffDashboard.css")) {
    content = content.replace(
      /['"]\.\/staffDashboard\.css['"]/g,
      "'@/features/staff/styles/staff-dashboard.css'",
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('FIXED:', path.relative(src, filePath));
  }
}

const dirs = [
  path.join(src, 'features'),
  path.join(src, 'shared'),
  path.join(src, 'app'),
];

for (const dir of dirs) {
  for (const file of walk(dir)) fixFile(file);
}

console.log('Import fix complete.');
