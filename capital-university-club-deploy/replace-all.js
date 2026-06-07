const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'Frontend', 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

let modifiedFiles = [];
let localizationIssues = [];

walkDir(FRONTEND_DIR, (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  // Ignore components since we're only fixing pages/views, but wait, maybe some components have tables too.
  // Actually, Shadcn tables might be defined in components. We should ignore ui components.
  if (filePath.includes(path.join('components', 'StaffPagesComponents', 'ui'))) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Table Unification
  if (content.includes('<table')) {
    let relativePathToUI = path.relative(path.dirname(filePath), path.join(FRONTEND_DIR, 'components', 'StaffPagesComponents', 'ui', 'table')).replace(/\\/g, '/');
    const importStatement = `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "${relativePathToUI}";\n`;

    if (!content.includes('import { Table')) {
        const importRegex = /^import\s+.*from\s+['"].*['"];?$/gm;
        let lastMatch;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }

        if (lastMatch) {
            const insertIndex = lastMatch.index + lastMatch[0].length + 1;
            content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
        } else {
            content = importStatement + content;
        }
    }

    content = content.replace(/<table\b[^>]*>/g, '<Table>');
    content = content.replace(/<\/table>/g, '</Table>');
    content = content.replace(/<thead/g, '<TableHeader');
    content = content.replace(/<\/thead>/g, '</TableHeader>');
    content = content.replace(/<tbody/g, '<TableBody');
    content = content.replace(/<\/tbody>/g, '</TableBody>');
    content = content.replace(/<tr\b/g, '<TableRow');
    content = content.replace(/<\/tr>/g, '</TableRow>');
    content = content.replace(/<th\b/g, '<TableHead');
    content = content.replace(/<\/th>/g, '</TableHead>');
    content = content.replace(/<td\b/g, '<TableCell');
    content = content.replace(/<\/td>/g, '</TableCell>');
  }

  // 2. Action Buttons Unification
  content = content.replace(/opacity-50 group-hover:opacity-100/g, '');
  content = content.replace(/opacity-0 group-hover:opacity-100/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.push(filePath);
  }

  // 3. Check for localization issues
  if (content.includes('name_ar ||') || content.includes('name_en ||')) {
      // Check if it already has isRTL or i18n
      if (!content.includes('isRTL ?') && !content.includes("i18n.language === 'ar'") && !content.includes("i18n.language == 'ar'")) {
         localizationIssues.push(filePath);
      }
  }
});

console.log("Modified Tables in:", modifiedFiles);
console.log("Potential Localization Issues in:", localizationIssues);
