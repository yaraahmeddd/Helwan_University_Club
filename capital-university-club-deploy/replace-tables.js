const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'Frontend', 'src', 'pages');

const files = [
  'RegistrationManagementPage.tsx',
  'ManageInvitationsPage.tsx',
  'SportManagementPage.tsx',
  'TeamsManagementPage.tsx',
  'CourtsManagementPage.tsx',
  '../features/register/pages/AssignmentPage.tsx',
  'AssignStaffPrivilegesPage.tsx',
  'RevokePrivilegesPage.tsx',
  'PrivilegePackageAdminPage.tsx',
  'MemberMembershipPage.tsx',
  'StaffListPage.tsx',
  'BranchManagementPage.tsx',
  'FacultyManagementPage.tsx',
  'ProfessionManagementPage.tsx',
  'PackageManagementPage.tsx' // User's active file
];

for (const file of files) {
  const filePath = path.join(PAGES_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - does not exist.`);
    continue;
  }

  // Calculate relative import path to components/StaffPagesComponents/ui/table
  let relativePath = '../components/StaffPagesComponents/ui/table';
  if (file.includes('features/register')) {
      relativePath = '../../../components/StaffPagesComponents/ui/table';
  }

  const importStatement = `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "${relativePath}";\n`;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Add import if not present and if it uses <table
  if (content.includes('<table') && !content.includes('import { Table')) {
    // Find the last import statement
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
        // Just prepend
        content = importStatement + content;
    }
  }

  // 2. Replace tags
  // Replace <table ...> -> <Table>
  content = content.replace(/<table\b[^>]*>/g, '<Table>');
  content = content.replace(/<\/table>/g, '</Table>');
  
  // Replace <thead ...> -> <TableHeader ...>
  content = content.replace(/<thead/g, '<TableHeader');
  content = content.replace(/<\/thead>/g, '</TableHeader>');

  // Replace <tbody ...> -> <TableBody ...>
  content = content.replace(/<tbody/g, '<TableBody');
  content = content.replace(/<\/tbody>/g, '</TableBody>');

  // Replace <tr ...> -> <TableRow ...>
  content = content.replace(/<tr\b/g, '<TableRow');
  content = content.replace(/<\/tr>/g, '</TableRow>');

  // Replace <th ...> -> <TableHead ...>  (avoiding replacing custom <Th ...)
  content = content.replace(/<th\b/g, '<TableHead');
  content = content.replace(/<\/th>/g, '</TableHead>');

  // Replace <td ...> -> <TableCell ...>
  content = content.replace(/<td\b/g, '<TableCell');
  content = content.replace(/<\/td>/g, '</TableCell>');
  
  // Fix hover opacity on action buttons
  content = content.replace(/opacity-50 group-hover:opacity-100/g, '');
  content = content.replace(/opacity-0 group-hover:opacity-100/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
}
