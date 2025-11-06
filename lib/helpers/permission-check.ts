// Add territory permissions to existing permission system
export const TERRITORY_PERMISSIONS = {
  VIEW_TERRITORIES: 'view_territories',
  MANAGE_TERRITORIES: 'manage_territories',
  ASSIGN_TERRITORIES: 'assign_territories',
  IMPORT_TERRITORIES: 'import_territories',
  VIEW_TERRITORY_ANALYTICS: 'view_territory_analytics'
} as const;

// Update route permissions mapping
export const TERRITORY_ROUTE_PERMISSIONS = {
  '/dashboard/territories': TERRITORY_PERMISSIONS.VIEW_TERRITORIES,
  '/dashboard/territories/map': TERRITORY_PERMISSIONS.VIEW_TERRITORIES,
  '/dashboard/territories/assignments': TERRITORY_PERMISSIONS.ASSIGN_TERRITORIES,
  '/dashboard/territories/analytics': TERRITORY_PERMISSIONS.VIEW_TERRITORY_ANALYTICS,
  '/dashboard/territories/import': TERRITORY_PERMISSIONS.IMPORT_TERRITORIES
} as const;

// Main route permissions mapping (for backward compatibility)
export const routePermissions = {
  '/dashboard/territories': 'territoryView',
  '/dashboard/territories/map': 'territoryView',
  '/dashboard/territories/assignments': 'territoryAssign',
  '/dashboard/territories/analytics': 'territoryAnalytics',
  '/dashboard/territories/import': 'territoryImport',
  '/dashboard/members': 'manageAllMembers',
  '/dashboard/members/map': 'manageAllMembers',
  '/dashboard/reports': 'manageAllReport',
  '/dashboard/attendance': 'manageAttendance',
  '/dashboard/field-service': 'fieldService',
  '/dashboard/financial': 'financial',
  '/dashboard/communication': 'communication'
} as const;