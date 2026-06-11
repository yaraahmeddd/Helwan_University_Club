import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const replacements = [
  ["@/features/dashboard/", "@/features/member-portal/"],
  ["@/features/register/", "@/features/registration/"],
  ["from '../DashboardComponents'", "from '../components/DashboardComponents'"],
  ["from \"../DashboardComponents\"", "from '../components/DashboardComponents'"],
  ["from '../Toast'", "from '../components/Toast'"],
  ["from '../SportCard'", "from '../components/SportCard'"],
  ["from '../NotificationPanel'", "from '../components/NotificationPanel'"],
  ["../../pages/ForbiddenPage", "@/features/auth/pages/ForbiddenPage"],
  ["./router.tsx", "./app/router"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules') continue;
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

for (const file of walk(src)) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (content.includes('<DashboardPage') && file.includes('TeamMemberDashboardPage')) {
    content = content.replace(/<DashboardPage/g, '<TeamMemberHomePage');
    content = content.replace(/<\/DashboardPage>/g, '</TeamMemberHomePage>');
    changed = true;
  }
  if (content.includes('SportDetailedPG')) {
    content = content.replace(/SportDetailedPG/g, 'SportDetailedPage');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('UPDATED:', path.relative(src, file));
  }
}

console.log('Path alias migration complete.');
