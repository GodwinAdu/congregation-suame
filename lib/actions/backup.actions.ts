'use server';

import { connectToDB } from '@/lib/mongoose';
import Member from '@/lib/models/user.models';
import Group from '@/lib/models/group.models';
import { Territory, TerritoryAssignment } from '@/lib/models/territory.models';
import FieldServiceReport from '@/lib/models/field-service.models';
import Activity from '@/lib/models/activity.models';
import AssignmentHistory from '@/lib/models/assignment-history.models';
import Assignment from '@/lib/models/assignment.models';
import Attendance from '@/lib/models/attendance.models';
import BibleStudy from '@/lib/models/bible-study.models';
import { CleaningTask } from '@/lib/models/cleaning.models';
import { COReport } from '@/lib/models/co-report.models';
import { COVisit } from '@/lib/models/co-visit.models';
import { Message, Broadcast } from '@/lib/models/communication.models';
import { Document } from '@/lib/models/document.models';
import { Duty } from '@/lib/models/duty.models';
import {Event} from '@/lib/models/event.models';
import Expense from '@/lib/models/expense.models';
import Family from '@/lib/models/family.models';
import FieldServiceMeeting from '@/lib/models/field-service-meeting.models';
import { Contribution, Budget, MonthlyReport, OpeningBalance } from '@/lib/models/financial.models';
import GroupSchedule from '@/lib/models/group-schedule.models';
import History from '@/lib/models/history.models';
import Literature from '@/lib/models/literature.models';
import {Notification} from '@/lib/models/notification.models';
import OverseerReport from '@/lib/models/overseer-report.models';
import Privilege from '@/lib/models/privilege.models';
import PublicWitnessing from '@/lib/models/public-witnessing.models';
import PublisherGoal from '@/lib/models/publisher-goal.models';
import PublisherRecord from '@/lib/models/publisher-record.models';
import PushSubscription from '@/lib/models/push-subscription.models';
import Role from '@/lib/models/role.models';
import SchoolStudent from '@/lib/models/school-student.models';
import ShepherdingCall from '@/lib/models/shepherding-call.models';
import Tash from '@/lib/models/tash.models';
import TransportConfig from '@/lib/models/transport-config.models';
import {TransportFee, MemberFeePayment} from '@/lib/models/transport-fee.models';
import { currentUser } from '@/lib/helpers/session';

export async function createBackup() {
  try {
    const user = await currentUser();
    if (!user) throw new Error('Unauthorized');

    await connectToDB();

    const [
      members, groups, territories, territoryAssignments, fieldServiceReports,
      activities, assignmentHistories, assignments, attendances, bibleStudies,
      cleaningTasks, coReports, coVisits, messages, broadcasts, documents,
      duties, events, expenses, families, fieldServiceMeetings,
      contributions, budgets, monthlyReports, openingBalances, groupSchedules, histories, literatures, notifications,
      overseerReports, privileges, publicWitnessings, publisherGoals, publisherRecords,
      pushSubscriptions, roles, schoolStudents, shepherdingCalls, tashes,
      transportConfigs, transportFees, memberFeePayments
    ] = await Promise.all([
      Member.find({}).lean(),
      Group.find({}).lean(),
      Territory.find({}).lean(),
      TerritoryAssignment.find({}).lean(),
      FieldServiceReport.find({}).lean(),
      Activity.find({}).lean(),
      AssignmentHistory.find({}).lean(),
      Assignment.find({}).lean(),
      Attendance.find({}).lean(),
      BibleStudy.find({}).lean(),
      CleaningTask.find({}).lean(),
      COReport.find({}).lean(),
      COVisit.find({}).lean(),
      Message.find({}).lean(),
      Broadcast.find({}).lean(),
      Document.find({}).lean(),
      Duty.find({}).lean(),
      Event.find({}).lean(),
      Expense.find({}).lean(),
      Family.find({}).lean(),
      FieldServiceMeeting.find({}).lean(),
      Contribution.find({}).lean(),
      Budget.find({}).lean(),
      MonthlyReport.find({}).lean(),
      OpeningBalance.find({}).lean(),
      GroupSchedule.find({}).lean(),
      History.find({}).lean(),
      Literature.find({}).lean(),
      Notification.find({}).lean(),
      OverseerReport.find({}).lean(),
      Privilege.find({}).lean(),
      PublicWitnessing.find({}).lean(),
      PublisherGoal.find({}).lean(),
      PublisherRecord.find({}).lean(),
      PushSubscription.find({}).lean(),
      Role.find({}).lean(),
      SchoolStudent.find({}).lean(),
      ShepherdingCall.find({}).lean(),
      Tash.find({}).lean(),
      TransportConfig.find({}).lean(),
      TransportFee.find({}).lean(),
      MemberFeePayment.find({}).lean()
    ]);

    const backup = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      data: {
        members,
        groups,
        territories,
        territoryAssignments,
        fieldServiceReports,
        activities,
        assignmentHistories,
        assignments,
        attendances,
        bibleStudies,
        cleaningTasks,
        coReports,
        coVisits,
        messages,
        broadcasts,
        documents,
        duties,
        events,
        expenses,
        families,
        fieldServiceMeetings,
        contributions,
        budgets,
        monthlyReports,
        openingBalances,
        groupSchedules,
        histories,
        literatures,
        notifications,
        overseerReports,
        privileges,
        publicWitnessings,
        publisherGoals,
        publisherRecords,
        pushSubscriptions,
        roles,
        schoolStudents,
        shepherdingCalls,
        tashes,
        transportConfigs,
        transportFees,
        memberFeePayments
      },
      metadata: {
        totalMembers: members.length,
        totalGroups: groups.length,
        totalTerritories: territories.length,
        totalRecords: members.length + groups.length + territories.length + territoryAssignments.length + fieldServiceReports.length + activities.length + assignmentHistories.length + assignments.length + attendances.length + bibleStudies.length + cleaningTasks.length + coReports.length + coVisits.length + messages.length + broadcasts.length + documents.length + duties.length + events.length + expenses.length + families.length + fieldServiceMeetings.length + contributions.length + budgets.length + monthlyReports.length + openingBalances.length + groupSchedules.length + histories.length + literatures.length + notifications.length + overseerReports.length + privileges.length + publicWitnessings.length + publisherGoals.length + publisherRecords.length + pushSubscriptions.length + roles.length + schoolStudents.length + shepherdingCalls.length + tashes.length + transportConfigs.length + transportFees.length + memberFeePayments.length,
        createdBy: user._id
      }
    };

    return { success: true, data: backup };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function restoreBackup(backupData: any) {
  try {
    await connectToDB();

    // Clear existing data
    await Promise.all([
      Member.deleteMany({}),
      Group.deleteMany({}),
      Territory.deleteMany({}),
      TerritoryAssignment.deleteMany({}),
      FieldServiceReport.deleteMany({}),
      Activity.deleteMany({}),
      AssignmentHistory.deleteMany({}),
      Assignment.deleteMany({}),
      Attendance.deleteMany({}),
      BibleStudy.deleteMany({}),
      CleaningTask.deleteMany({}),
      COReport.deleteMany({}),
      COVisit.deleteMany({}),
      Message.deleteMany({}),
      Broadcast.deleteMany({}),
      Document.deleteMany({}),
      Duty.deleteMany({}),
      Event.deleteMany({}),
      Expense.deleteMany({}),
      Family.deleteMany({}),
      FieldServiceMeeting.deleteMany({}),
      Contribution.deleteMany({}),
      Budget.deleteMany({}),
      MonthlyReport.deleteMany({}),
      OpeningBalance.deleteMany({}),
      GroupSchedule.deleteMany({}),
      History.deleteMany({}),
      Literature.deleteMany({}),
      Notification.deleteMany({}),
      OverseerReport.deleteMany({}),
      Privilege.deleteMany({}),
      PublicWitnessing.deleteMany({}),
      PublisherGoal.deleteMany({}),
      PublisherRecord.deleteMany({}),
      PushSubscription.deleteMany({}),
      Role.deleteMany({}),
      SchoolStudent.deleteMany({}),
      ShepherdingCall.deleteMany({}),
      Tash.deleteMany({}),
      TransportConfig.deleteMany({}),
      TransportFee.deleteMany({}),
      MemberFeePayment.deleteMany({})
    ]);

    // Restore data with validation disabled
    const insertOptions = { ordered: false, validateBeforeSave: false };
    const restorePromises = [];
    
    if (backupData.data.members?.length) restorePromises.push(Member.insertMany(backupData.data.members, insertOptions));
    if (backupData.data.groups?.length) restorePromises.push(Group.insertMany(backupData.data.groups, insertOptions));
    if (backupData.data.territories?.length) restorePromises.push(Territory.insertMany(backupData.data.territories, insertOptions));
    if (backupData.data.territoryAssignments?.length) restorePromises.push(TerritoryAssignment.insertMany(backupData.data.territoryAssignments, insertOptions));
    if (backupData.data.fieldServiceReports?.length) restorePromises.push(FieldServiceReport.insertMany(backupData.data.fieldServiceReports, insertOptions));
    if (backupData.data.activities?.length) restorePromises.push(Activity.insertMany(backupData.data.activities, insertOptions));
    if (backupData.data.assignmentHistories?.length) restorePromises.push(AssignmentHistory.insertMany(backupData.data.assignmentHistories, insertOptions));
    if (backupData.data.assignments?.length) restorePromises.push(Assignment.insertMany(backupData.data.assignments, insertOptions));
    if (backupData.data.attendances?.length) restorePromises.push(Attendance.insertMany(backupData.data.attendances, insertOptions));
    if (backupData.data.bibleStudies?.length) restorePromises.push(BibleStudy.insertMany(backupData.data.bibleStudies, insertOptions));
    if (backupData.data.cleaningTasks?.length) restorePromises.push(CleaningTask.insertMany(backupData.data.cleaningTasks, insertOptions));
    if (backupData.data.coReports?.length) restorePromises.push(COReport.insertMany(backupData.data.coReports, insertOptions));
    if (backupData.data.coVisits?.length) restorePromises.push(COVisit.insertMany(backupData.data.coVisits, insertOptions));
    if (backupData.data.messages?.length) restorePromises.push(Message.insertMany(backupData.data.messages, insertOptions));
    if (backupData.data.broadcasts?.length) restorePromises.push(Broadcast.insertMany(backupData.data.broadcasts, insertOptions));
    if (backupData.data.documents?.length) restorePromises.push(Document.insertMany(backupData.data.documents, insertOptions));
    if (backupData.data.duties?.length) restorePromises.push(Duty.insertMany(backupData.data.duties, insertOptions));
    if (backupData.data.events?.length) restorePromises.push(Event.insertMany(backupData.data.events, insertOptions));
    if (backupData.data.expenses?.length) restorePromises.push(Expense.insertMany(backupData.data.expenses, insertOptions));
    if (backupData.data.families?.length) restorePromises.push(Family.insertMany(backupData.data.families, insertOptions));
    if (backupData.data.fieldServiceMeetings?.length) restorePromises.push(FieldServiceMeeting.insertMany(backupData.data.fieldServiceMeetings, insertOptions));
    if (backupData.data.contributions?.length) restorePromises.push(Contribution.insertMany(backupData.data.contributions, insertOptions));
    if (backupData.data.budgets?.length) restorePromises.push(Budget.insertMany(backupData.data.budgets, insertOptions));
    if (backupData.data.monthlyReports?.length) restorePromises.push(MonthlyReport.insertMany(backupData.data.monthlyReports, insertOptions));
    if (backupData.data.openingBalances?.length) restorePromises.push(OpeningBalance.insertMany(backupData.data.openingBalances, insertOptions));
    if (backupData.data.groupSchedules?.length) restorePromises.push(GroupSchedule.insertMany(backupData.data.groupSchedules, insertOptions));
    if (backupData.data.histories?.length) restorePromises.push(History.insertMany(backupData.data.histories, insertOptions));
    if (backupData.data.literatures?.length) restorePromises.push(Literature.insertMany(backupData.data.literatures, insertOptions));
    if (backupData.data.notifications?.length) restorePromises.push(Notification.insertMany(backupData.data.notifications, insertOptions));
    if (backupData.data.overseerReports?.length) restorePromises.push(OverseerReport.insertMany(backupData.data.overseerReports, insertOptions));
    if (backupData.data.privileges?.length) restorePromises.push(Privilege.insertMany(backupData.data.privileges, insertOptions));
    if (backupData.data.publicWitnessings?.length) restorePromises.push(PublicWitnessing.insertMany(backupData.data.publicWitnessings, insertOptions));
    if (backupData.data.publisherGoals?.length) restorePromises.push(PublisherGoal.insertMany(backupData.data.publisherGoals, insertOptions));
    if (backupData.data.publisherRecords?.length) restorePromises.push(PublisherRecord.insertMany(backupData.data.publisherRecords, insertOptions));
    if (backupData.data.pushSubscriptions?.length) restorePromises.push(PushSubscription.insertMany(backupData.data.pushSubscriptions, insertOptions));
    if (backupData.data.roles?.length) restorePromises.push(Role.insertMany(backupData.data.roles, insertOptions));
    if (backupData.data.schoolStudents?.length) restorePromises.push(SchoolStudent.insertMany(backupData.data.schoolStudents, insertOptions));
    if (backupData.data.shepherdingCalls?.length) restorePromises.push(ShepherdingCall.insertMany(backupData.data.shepherdingCalls, insertOptions));
    if (backupData.data.tashes?.length) restorePromises.push(Tash.insertMany(backupData.data.tashes, insertOptions));
    if (backupData.data.transportConfigs?.length) restorePromises.push(TransportConfig.insertMany(backupData.data.transportConfigs, insertOptions));
    if (backupData.data.transportFees?.length) restorePromises.push(TransportFee.insertMany(backupData.data.transportFees, insertOptions));
    if (backupData.data.memberFeePayments?.length) restorePromises.push(MemberFeePayment.insertMany(backupData.data.memberFeePayments, insertOptions));
    
    // Support old backup format (v1.0)
    if (backupData.data.assignments && !backupData.data.territoryAssignments) {
      restorePromises.push(TerritoryAssignment.insertMany(backupData.data.assignments, insertOptions));
    }
    if (backupData.data.reports && !backupData.data.fieldServiceReports) {
      restorePromises.push(FieldServiceReport.insertMany(backupData.data.reports, insertOptions));
    }

    await Promise.all(restorePromises);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportBackupFile(format: 'json' | 'csv' = 'json', dataType?: string) {
  try {
    const result = await createBackup();
    if (!result.success) throw new Error(result.error);

    const date = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      const filename = `congregation-backup-${date}.json`;
      const content = JSON.stringify(result.data, null, 2);
      return { success: true, data: { filename, content, type: 'application/json' } };
    }

    if (format === 'csv') {
      const csvContent = convertToCSV(result.data, dataType || 'members');
      const filename = `congregation-${dataType || 'members'}-${date}.csv`;
      return { success: true, data: { filename, content: csvContent, type: 'text/csv' } };
    }

    throw new Error('Unsupported format');
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function convertToCSV(data: any, type: string) {
  if (type === 'members') {
    if (data.data.members.length === 0) return 'No data available';
    const headers = ['Full Name', 'Email', 'Phone', 'Gender', 'Baptized Date', 'Pioneer Status', 'Address'];
    const csvRows = [headers.join(',')];
    data.data.members.forEach((m: any) => {
      const row = [
        m.fullName || '', m.email || '', m.phone || '', m.gender || '',
        m.baptizedDate ? new Date(m.baptizedDate).toLocaleDateString() : '',
        m.pioneerStatus || 'none', m.address || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  if (type === 'groups') {
    if (data.data.groups.length === 0) return 'No data available';
    const headers = ['Name', 'Description', 'Overseer', 'Assistant', 'Member Count'];
    const csvRows = [headers.join(',')];
    data.data.groups.forEach((g: any) => {
      const row = [
        g.name || '', g.description || '', g.overseer || '', g.assistant || '', g.members?.length || 0
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  if (type === 'territories') {
    if (data.data.territories.length === 0) return 'No data available';
    const headers = ['Number', 'Name', 'Type', 'Difficulty', 'Estimated Hours', 'Household Count', 'Active'];
    const csvRows = [headers.join(',')];
    data.data.territories.forEach((t: any) => {
      const row = [
        t.number || '', t.name || '', t.type || '', t.difficulty || '',
        t.estimatedHours || 0, t.householdCount || 0, t.isActive ? 'Yes' : 'No'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  if (type === 'reports') {
    if (data.data.reports.length === 0) return 'No data available';
    const headers = ['Month', 'Publisher', 'Hours', 'Bible Students', 'Auxiliary Pioneer'];
    const csvRows = [headers.join(',')];
    data.data.reports.forEach((r: any) => {
      const row = [
        r.month || '', r.publisher || '', r.hours || 0, r.bibleStudents || 0,
        r.auxiliaryPioneer ? 'Yes' : 'No'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    });
    return csvRows.join('\n');
  }

  return 'Invalid data type';
}
