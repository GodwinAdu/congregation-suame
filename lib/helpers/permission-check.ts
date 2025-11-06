import { currentUserRole } from "./get-user-role";

export interface PermissionMap {
  [key: string]: string;
}

// Map routes to permission keys
export const routePermissions: PermissionMap = {
  // Core Dashboard
  '/dashboard': 'dashboard',
  '/dashboard/publisher': 'publisherDashboard',
  '/dashboard/profile': 'profile',
  '/dashboard/settings': 'settings',
  '/dashboard/reset-password': 'resetPassword',
  
  // Configuration
  '/dashboard/config': 'config',
  '/dashboard/config/duties': 'configDuties',
  '/dashboard/config/group': 'configGroup',
  '/dashboard/config/privilege': 'configPrivilege',
  '/dashboard/config/role': 'configRole',
  '/dashboard/update-permissions': 'updatePermissions',
  
  // Member Management
  '/dashboard/members': 'manageAllMembers',
  '/dashboard/group': 'manageGroupMembers',
  '/dashboard/members/analytics': 'memberAnalytics',
  '/dashboard/members/families': 'memberFamilies',
  
  // Reports
  '/dashboard/manage-report': 'manageAllReport',
  '/dashboard/manage-group-report': 'manageGroupReport',
  '/dashboard/monthly-report': 'monthlyReport',
  '/dashboard/monthly-report/help-needed': 'monthlyReportHelpNeeded',
  '/dashboard/overseer-report': 'overseerReports',
  '/dashboard/overseer-analytics': 'overseerAnalytics',
  
  // Attendance
  '/dashboard/attendance': 'manageAttendance',
  '/dashboard/attendance/attendance-tracker': 'attendanceTracker',
  
  // Assignments & Meetings
  '/dashboard/assignments': 'assignments',
  '/dashboard/calendar': 'calendar',
  
  // Field Service
  '/dashboard/field-service': 'fieldService',
  '/dashboard/field-service/meeting-schedule': 'fieldServiceMeetingSchedule',
  '/dashboard/field-service/public-witnessing': 'fieldServicePublicWitnessing',
  
  // Financial
  '/dashboard/financial': 'financial',
  '/dashboard/financial/analytics': 'financialAnalytics',
  '/dashboard/financial/budget': 'financialBudget',
  '/dashboard/financial/contributions': 'financialContributions',
  '/dashboard/financial/expenses': 'financialExpenses',
  
  // Communication
  '/dashboard/communication': 'communication',
  '/dashboard/communication/announcements': 'communicationAnnouncements',
  '/dashboard/communication/broadcasts': 'communicationBroadcasts',
  '/dashboard/communication/messages': 'communicationMessages',
  
  // Other Features
  '/dashboard/territory': 'territory',
  '/dashboard/cleaning': 'cleaning',
  '/dashboard/transport': 'transport',
  '/dashboard/events': 'events',
  '/dashboard/documents': 'documents',
  '/dashboard/documents/forms': 'documentForms',
  '/dashboard/notifications': 'notifications',
  
  // AI Features
  '/dashboard/ai': 'aiAssistant',
  '/dashboard/ai/analytics': 'aiAnalytics',
  '/dashboard/ai/assignments': 'aiAssignments',
  '/dashboard/ai/insights': 'aiInsights',
  
  // System
  '/dashboard/history': 'history',
  '/dashboard/trash': 'trash'
};

export async function checkPermission(route: string): Promise<boolean> {
  try {
    const userRole = await currentUserRole();
    if (!userRole) return false;

    const permissionKey = routePermissions[route];
    if (!permissionKey) return true; // Allow access if no specific permission required

    return userRole.permissions[permissionKey] || false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const userRole = await currentUserRole();
    if (!userRole) return false;

    return userRole.permissions[permission] || false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

