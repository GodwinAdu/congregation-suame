const fs = require('fs');
const path = require('path');

const pagesWithProtection = [
  { path: '/dashboard/attendance', file: 'app/(dashboard)/(routes)/dashboard/attendance/page.tsx' },
  { path: '/dashboard/attendance/attendance-tracker', file: 'app/(dashboard)/(routes)/dashboard/attendance/attendance-tracker/page.tsx' },
  { path: '/dashboard/assignments', file: 'app/(dashboard)/(routes)/dashboard/assignments/page.tsx' },
  { path: '/dashboard/calendar', file: 'app/(dashboard)/(routes)/dashboard/calendar/page.tsx' },
  { path: '/dashboard/cleaning', file: 'app/(dashboard)/(routes)/dashboard/cleaning/page.tsx' },
  { path: '/dashboard/config/duties', file: 'app/(dashboard)/(routes)/dashboard/config/duties/page.tsx' },
  { path: '/dashboard/config/group', file: 'app/(dashboard)/(routes)/dashboard/config/group/page.tsx' },
  { path: '/dashboard/config/privilege', file: 'app/(dashboard)/(routes)/dashboard/config/privilege/page.tsx' },
  { path: '/dashboard/documents', file: 'app/(dashboard)/(routes)/dashboard/documents/page.tsx' },
  { path: '/dashboard/documents/forms', file: 'app/(dashboard)/(routes)/dashboard/documents/forms/page.tsx' },
  { path: '/dashboard/events', file: 'app/(dashboard)/(routes)/dashboard/events/page.tsx' },
  { path: '/dashboard/field-service/meeting-schedule', file: 'app/(dashboard)/(routes)/dashboard/field-service/meeting-schedule/page.tsx' },
  { path: '/dashboard/field-service/public-witnessing', file: 'app/(dashboard)/(routes)/dashboard/field-service/public-witnessing/page.tsx' },
  { path: '/dashboard/financial/analytics', file: 'app/(dashboard)/(routes)/dashboard/financial/analytics/page.tsx' },
  { path: '/dashboard/financial/budget', file: 'app/(dashboard)/(routes)/dashboard/financial/budget/page.tsx' },
  { path: '/dashboard/financial/expenses', file: 'app/(dashboard)/(routes)/dashboard/financial/expenses/page.tsx' },
  { path: '/dashboard/manage-report', file: 'app/(dashboard)/(routes)/dashboard/manage-report/page.tsx' },
  { path: '/dashboard/manage-group-report', file: 'app/(dashboard)/(routes)/dashboard/manage-group-report/page.tsx' },
  { path: '/dashboard/members/analytics', file: 'app/(dashboard)/(routes)/dashboard/members/analytics/page.tsx' },
  { path: '/dashboard/members/families', file: 'app/(dashboard)/(routes)/dashboard/members/families/page.tsx' },
  { path: '/dashboard/notifications', file: 'app/(dashboard)/(routes)/dashboard/notifications/page.tsx' },
  { path: '/dashboard/overseer-analytics', file: 'app/(dashboard)/(routes)/dashboard/overseer-analytics/page.tsx' },
  { path: '/dashboard/transport', file: 'app/(dashboard)/(routes)/dashboard/transport/page.tsx' }
];

function addProtectionToPage(filePath, routePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if already protected
    if (content.includes('requirePermission')) {
      console.log(`Already protected: ${filePath}`);
      return;
    }

    // Add import
    if (!content.includes('requirePermission')) {
      const importMatch = content.match(/^(import.*\n)+/m);
      if (importMatch) {
        const lastImportIndex = importMatch[0].lastIndexOf('\n');
        const beforeImports = content.substring(0, importMatch.index + lastImportIndex);
        const afterImports = content.substring(importMatch.index + lastImportIndex);
        
        content = beforeImports + 
                 "\nimport { requirePermission } from '@/lib/helpers/server-permission-check'" + 
                 afterImports;
      }
    }

    // Add permission check to function
    const functionMatch = content.match(/(const \w+ = async \(\) => \{|export default async function \w+\(\) \{)/);
    if (functionMatch) {
      const insertIndex = functionMatch.index + functionMatch[0].length;
      const before = content.substring(0, insertIndex);
      const after = content.substring(insertIndex);
      
      content = before + `\n    await requirePermission('${routePath}')` + after;
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Protected: ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all pages
pagesWithProtection.forEach(({ path: routePath, file }) => {
  addProtectionToPage(file, routePath);
});

console.log('Page protection script completed!');