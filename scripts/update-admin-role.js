const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Role Schema
const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: {
    dashboard: Boolean,
    publisherDashboard: Boolean,
    profile: Boolean,
    settings: Boolean,
    resetPassword: Boolean,
    config: Boolean,
    configDuties: Boolean,
    configGroup: Boolean,
    configPrivilege: Boolean,
    configRole: Boolean,
    updatePermissions: Boolean,
    manageAllMembers: Boolean,
    manageGroupMembers: Boolean,
    memberAnalytics: Boolean,
    memberFamilies: Boolean,
    manageAllReport: Boolean,
    manageGroupReport: Boolean,
    monthlyReport: Boolean,
    monthlyReportHelpNeeded: Boolean,
    overseerReports: Boolean,
    overseerAnalytics: Boolean,
    manageAttendance: Boolean,
    attendanceTracker: Boolean,
    assignments: Boolean,
    calendar: Boolean,
    fieldService: Boolean,
    fieldServiceMeetingSchedule: Boolean,
    fieldServicePublicWitnessing: Boolean,
    financial: Boolean,
    financialAnalytics: Boolean,
    financialBudget: Boolean,
    financialContributions: Boolean,
    financialExpenses: Boolean,
    communication: Boolean,
    communicationAnnouncements: Boolean,
    communicationBroadcasts: Boolean,
    communicationMessages: Boolean,
    territory: Boolean,
    territoryView: Boolean,
    territoryManage: Boolean,
    territoryAssign: Boolean,
    territoryAnalytics: Boolean,
    territoryImport: Boolean,
    coVisitView: Boolean,
    coVisitManage: Boolean,
    coVisitSchedule: Boolean,
    shepherdingView: Boolean,
    shepherdingManage: Boolean,
    assignmentHistoryView: Boolean,
    assignmentHistoryManage: Boolean,
    bibleStudyView: Boolean,
    bibleStudyManage: Boolean,
    publisherGoals: Boolean,
    publisherRecords: Boolean,
    literature: Boolean,
    theocraticSchool: Boolean,
    emergency: Boolean,
    expenses: Boolean,
    cleaning: Boolean,
    transport: Boolean,
    events: Boolean,
    documents: Boolean,
    documentForms: Boolean,
    notifications: Boolean,
    aiAssistant: Boolean,
    aiAnalytics: Boolean,
    aiAssignments: Boolean,
    aiInsights: Boolean,
    history: Boolean,
    trash: Boolean,
    manageUser: Boolean
  }
}, { timestamps: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

// Update admin role with full permissions
const updateAdminRole = async () => {
  try {
    console.log('\n🔄 Updating admin role...\n');

    const fullPermissions = {
      'permissions.dashboard': true,
      'permissions.publisherDashboard': true,
      'permissions.profile': true,
      'permissions.settings': true,
      'permissions.resetPassword': true,
      'permissions.config': true,
      'permissions.configDuties': true,
      'permissions.configGroup': true,
      'permissions.configPrivilege': true,
      'permissions.configRole': true,
      'permissions.updatePermissions': true,
      'permissions.manageAllMembers': true,
      'permissions.manageGroupMembers': true,
      'permissions.memberAnalytics': true,
      'permissions.memberFamilies': true,
      'permissions.manageAllReport': true,
      'permissions.manageGroupReport': true,
      'permissions.monthlyReport': true,
      'permissions.monthlyReportHelpNeeded': true,
      'permissions.overseerReports': true,
      'permissions.overseerAnalytics': true,
      'permissions.manageAttendance': true,
      'permissions.attendanceTracker': true,
      'permissions.assignments': true,
      'permissions.calendar': true,
      'permissions.fieldService': true,
      'permissions.fieldServiceMeetingSchedule': true,
      'permissions.fieldServicePublicWitnessing': true,
      'permissions.financial': true,
      'permissions.financialAnalytics': true,
      'permissions.financialBudget': true,
      'permissions.financialContributions': true,
      'permissions.financialExpenses': true,
      'permissions.communication': true,
      'permissions.communicationAnnouncements': true,
      'permissions.communicationBroadcasts': true,
      'permissions.communicationMessages': true,
      'permissions.territory': true,
      'permissions.territoryView': true,
      'permissions.territoryManage': true,
      'permissions.territoryAssign': true,
      'permissions.territoryAnalytics': true,
      'permissions.territoryImport': true,
      'permissions.coVisitView': true,
      'permissions.coVisitManage': true,
      'permissions.coVisitSchedule': true,
      'permissions.shepherdingView': true,
      'permissions.shepherdingManage': true,
      'permissions.assignmentHistoryView': true,
      'permissions.assignmentHistoryManage': true,
      'permissions.bibleStudyView': true,
      'permissions.bibleStudyManage': true,
      'permissions.publisherGoals': true,
      'permissions.publisherRecords': true,
      'permissions.literature': true,
      'permissions.theocraticSchool': true,
      'permissions.emergency': true,
      'permissions.expenses': true,
      'permissions.cleaning': true,
      'permissions.transport': true,
      'permissions.events': true,
      'permissions.documents': true,
      'permissions.documentForms': true,
      'permissions.notifications': true,
      'permissions.aiAssistant': true,
      'permissions.aiAnalytics': true,
      'permissions.aiAssignments': true,
      'permissions.aiInsights': true,
      'permissions.history': true,
      'permissions.trash': true,
      'permissions.manageUser': true
    };

    const result = await Role.updateOne(
      { name: 'admin' },
      { $set: fullPermissions }
    );

    if (result.matchedCount === 0) {
      console.log('✗ Admin role not found');
      console.log('📝 Creating admin role with full permissions...\n');
      
      await Role.create({
        name: 'admin',
        permissions: Object.keys(fullPermissions).reduce((acc, key) => {
          const permKey = key.replace('permissions.', '');
          acc[permKey] = true;
          return acc;
        }, {})
      });
      
      console.log('✓ Admin role created successfully');
    } else if (result.modifiedCount > 0) {
      console.log('✓ Admin role updated successfully');
    } else {
      console.log('ℹ Admin role already has full permissions');
    }

    // Display updated role
    const adminRole = await Role.findOne({ name: 'admin' });
    const enabledPermissions = Object.entries(adminRole.permissions)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    console.log(`\n📊 Admin Role Status:`);
    console.log(`   Total Permissions: ${enabledPermissions.length}`);
    console.log(`   All Enabled: ${enabledPermissions.length === Object.keys(fullPermissions).length ? '✓' : '✗'}`);

  } catch (error) {
    console.error('✗ Error updating admin role:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await updateAdminRole();
    console.log('\n✅ Script completed successfully\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
};

main();
