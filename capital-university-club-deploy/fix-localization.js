const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'Frontend', 'src');
const issues = [
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\components\\LandingPageComponents\\Clubs.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\context\\AuthContext.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\features\\dashboard\\pages\\CourtRentalPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\features\\dashboard\\pages\\DashboardPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\features\\dashboard\\pages\\SportsExplorePage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\AddNewStaffPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\AssignStaffPrivilegesPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\Dashboard.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\DashboardPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\Landingpage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\MemberHomePage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\MemberPortal.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\MembershipFormPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\MemberSportsPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\MemberSubscribePage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\NewRegister.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\ReservationPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\SportDetailedPG.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\StaffManagementPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\StaffProfile.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\SubscriptionsPage.tsx',
  'C:\\Users\\lenovo\\Desktop\\GP\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\teammemberdashboard.tsx'
];

for (const filePath of issues) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Pattern 1: x.name_ar || x.name_en
  const regex1 = /([a-zA-Z0-9_\.\?]+name_ar)\s*\|\|\s*([a-zA-Z0-9_\.\?]+name_en)/g;
  content = content.replace(regex1, `(i18n.language === 'ar' ? ($1 || $2) : ($2 || $1))`);

  // Pattern 2: x.sport_name_ar || x.sport_name_en
  const regex2 = /([a-zA-Z0-9_\.\?]+sport_name_ar)\s*\|\|\s*([a-zA-Z0-9_\.\?]+sport_name_en)/g;
  content = content.replace(regex2, `(i18n.language === 'ar' ? ($1 || $2) : ($2 || $1))`);

  // Pattern 3: x.team_name_ar || x.team_name_en
  const regex3 = /([a-zA-Z0-9_\.\?]+team_name_ar)\s*\|\|\s*([a-zA-Z0-9_\.\?]+team_name_en)/g;
  content = content.replace(regex3, `(i18n.language === 'ar' ? ($1 || $2) : ($2 || $1))`);

  if (content !== originalContent) {
    // Make sure i18n is imported
    if (!content.includes('import i18n')) {
        const relativePathToSrc = path.relative(path.dirname(filePath), FRONTEND_DIR).replace(/\\/g, '/');
        const importPath = relativePathToSrc === '' ? './i18n' : `${relativePathToSrc}/i18n`;
        const importStatement = `import i18n from "${importPath}";\n`;

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

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed localization in ${path.basename(filePath)}`);
  }
}
