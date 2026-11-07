// Single source of truth for which role permission each dashboard route needs.
// It mirrors the sidebar (components/sidebar/nav-main.tsx): a page needs its own
// roleField if it has one, otherwise the roleField of the sidebar group it sits in.
//
// A value is a permission key (or a list where ANY one is enough).
// `null` means any signed-in user may open the route.
// The longest matching prefix wins, so sub-routes can be stricter than their folder.

export type RouteRule = string | string[] | null;

export const ROUTE_ACCESS: Record<string, RouteRule> = {
  '/dashboard': 'dashboard',

  // Personal / open to every signed-in user
  '/dashboard/profile': null,
  '/dashboard/reset-password': null,

  // Publisher area
  '/dashboard/publisher': 'publisherDashboard',
  '/dashboard/daily-reports': 'publisherDashboard',
  '/dashboard/publisher/goals': 'publisherGoals',

  // Configuration
  '/dashboard/config': 'config',

  // Attendance
  '/dashboard/attendance': 'manageAttendance',

  // Members
  '/dashboard/members': 'manageAllMembers',

  // Field service reports
  '/dashboard/manage-report': 'manageAllReport',
  '/dashboard/field-service': 'manageAllReport',
  '/dashboard/overseer-report': 'overseerReports',
  '/dashboard/overseer-analytics': 'overseerAnalytics',
  '/dashboard/monthly-report': 'monthlyReport',
  '/dashboard/monthly-report/help-needed': 'monthlyReportHelpNeeded',

  // Group overseers
  '/dashboard/group': 'manageGroupReport',
  '/dashboard/manage-group-report': 'manageGroupReport',

  // Congregation records
  '/dashboard/shepherding': 'shepherdingView',
  '/dashboard/bible-studies': 'bibleStudyView',
  // S-21 cards are also needed by whoever views the CO visit packet.
  '/dashboard/publisher-records': ['publisherRecords', 'manageAllMembers', 'coVisitView'],
  '/dashboard/literature': 'literature',
  '/dashboard/theocratic-school': 'theocraticSchool',
  '/dashboard/emergency': 'emergency',
  '/dashboard/transport': 'transport',

  // Meetings
  '/dashboard/assignments': 'assignments',
  '/dashboard/assignments/history': 'assignmentHistoryView',
  '/dashboard/meetings': 'assignments',
  '/dashboard/cleaning': 'cleaning',

  // Territories
  '/dashboard/territory': 'territory',
  '/dashboard/territories': 'territoryView',
  '/dashboard/territories/list': 'territoryManage',
  '/dashboard/territories/manage': 'territoryManage',
  '/dashboard/territories/assignments': 'territoryAssign',
  '/dashboard/territories/analytics': 'territoryAnalytics',
  '/dashboard/territories/import': 'territoryImport',

  // Circuit overseer visits
  '/dashboard/co-visit': 'coVisitView',
  '/dashboard/co-visit/manage': 'coVisitManage',
  '/dashboard/co-visit/schedule': 'coVisitSchedule',
  '/dashboard/co-visit/reports/create': 'coVisitManage',

  // Finance, communication, events, documents
  '/dashboard/financial': 'financial',
  '/dashboard/expenses': 'financial',
  '/dashboard/communication': 'communication',
  '/dashboard/events': 'events',
  '/dashboard/calendar': 'events',
  '/dashboard/documents': 'documents',

  // AI, notifications, history
  '/dashboard/ai': 'aiAssistant',
  '/dashboard/notifications': 'notifications',
  '/dashboard/history': 'history',

  // Settings
  '/dashboard/settings': 'settings',
  '/dashboard/settings/activity-log': 'config',
  '/dashboard/settings/meeting-schedule': 'config',
  '/dashboard/backup': 'config',
  '/dashboard/update-permissions': 'updatePermissions',
  '/dashboard/trash': 'trash',
};

const stripLocale = (path: string) => path.replace(/^\/(en|tw)(?=\/|$)/, '') || '/';

/** Returns the rule for a path (longest prefix wins), or undefined when no rule covers it. */
export function ruleForPath(path: string): RouteRule | undefined {
  const clean = stripLocale(path.split('?')[0]).replace(/\/+$/, '') || '/';
  let best: string | undefined;
  for (const prefix of Object.keys(ROUTE_ACCESS)) {
    const matches = clean === prefix || clean.startsWith(prefix + '/');
    if (matches && (!best || prefix.length > best.length)) best = prefix;
  }
  return best === undefined ? undefined : ROUTE_ACCESS[best];
}

/** True when the permissions satisfy the rule. */
export function satisfiesRule(rule: RouteRule, permissions: Record<string, boolean> | undefined): boolean {
  if (rule === null) return true;
  const keys = Array.isArray(rule) ? rule : [rule];
  return keys.some((k) => !!permissions?.[k]);
}
