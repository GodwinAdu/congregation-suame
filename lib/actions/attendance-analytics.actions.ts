'use server';

import { connectToDB } from '@/lib/mongoose';
import Attendance from '@/lib/models/attendance.models';
import MemberAttendance from '@/lib/models/member-attendance.models';
import Member from '@/lib/models/user.models';
import { User, withAuth } from '@/lib/helpers/auth';
import { revalidatePath } from 'next/cache';

// ── Individual Member Attendance Analytics ────────────────────────────────────

export async function getAttendanceAnalytics(congregationId: string, months: number = 6) {
  try {
    await connectToDB();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get all members
    const members = await Member.find({})
      .select('fullName phone groupId')
      .populate('groupId', 'name')
      .lean();

    // Get all individual attendance records for the period
    const records = await MemberAttendance.find({
      meetingDate: { $gte: startDate },
      present: true
    }).lean();

    // Get total meetings in the period (from aggregate attendance)
    const meetings = await Attendance.find({
      date: { $gte: startDate }
    }).lean();

    const totalMeetings = meetings.length;
    const midweekMeetings = meetings.filter(m => m.meetingType === 'Midweek').length;
    const weekendMeetings = meetings.filter(m => m.meetingType === 'Weekend').length;

    // Calculate per-member stats
    const analytics = members.map((member: any) => {
      const memberRecords = records.filter(r => r.memberId.toString() === member._id.toString());
      const midweekAttended = memberRecords.filter(r => r.meetingType === 'Midweek').length;
      const weekendAttended = memberRecords.filter(r => r.meetingType === 'Weekend').length;
      const totalAttended = memberRecords.length;

      const attendanceRate = totalMeetings > 0 ? Math.round((totalAttended / totalMeetings) * 100) : 0;
      const midweekRate = midweekMeetings > 0 ? Math.round((midweekAttended / midweekMeetings) * 100) : 0;
      const weekendRate = weekendMeetings > 0 ? Math.round((weekendAttended / weekendMeetings) * 100) : 0;

      // Find last attendance date
      const lastRecord = memberRecords.sort((a, b) =>
        new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
      )[0];

      return {
        member: {
          _id: member._id,
          firstName: member.fullName?.split(' ')[0] || '',
          lastName: member.fullName?.split(' ').slice(1).join(' ') || '',
          fullName: member.fullName,
          group: member.groupId?.name || 'Unassigned',
          phone: member.phone || '',
        },
        attendanceRate,
        midweekRate,
        weekendRate,
        attendedMeetings: totalAttended,
        totalMeetings,
        lastAttendance: lastRecord?.meetingDate || null,
      };
    });

    // Sort by attendance rate ascending (worst first for shepherding attention)
    analytics.sort((a, b) => a.attendanceRate - b.attendanceRate);

    return { success: true, data: JSON.parse(JSON.stringify(analytics)) };
  } catch (error: any) {
    console.error('Error getting attendance analytics:', error);
    return { success: false, error: error.message };
  }
}

export async function getDecliningAttendance(congregationId: string) {
  try {
    await connectToDB();

    // Compare last 2 months vs previous 2 months
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    const members = await Member.find({})
      .select('fullName phone')
      .lean();

    // Recent period records
    const recentRecords = await MemberAttendance.find({
      meetingDate: { $gte: twoMonthsAgo },
      present: true
    }).lean();

    // Older period records
    const olderRecords = await MemberAttendance.find({
      meetingDate: { $gte: fourMonthsAgo, $lt: twoMonthsAgo },
      present: true
    }).lean();

    // Count meetings in each period
    const recentMeetings = await Attendance.countDocuments({ date: { $gte: twoMonthsAgo } });
    const olderMeetings = await Attendance.countDocuments({ date: { $gte: fourMonthsAgo, $lt: twoMonthsAgo } });

    if (recentMeetings === 0 || olderMeetings === 0) {
      return { success: true, data: [] };
    }

    const declining = members.map((member: any) => {
      const recentCount = recentRecords.filter(r => r.memberId.toString() === member._id.toString()).length;
      const olderCount = olderRecords.filter(r => r.memberId.toString() === member._id.toString()).length;

      const recentRate = Math.round((recentCount / recentMeetings) * 100);
      const olderRate = Math.round((olderCount / olderMeetings) * 100);
      const decline = olderRate - recentRate;

      return {
        member: {
          _id: member._id,
          firstName: member.fullName?.split(' ')[0] || '',
          lastName: member.fullName?.split(' ').slice(1).join(' ') || '',
          fullName: member.fullName,
          phone: member.phone || '',
        },
        recentRate,
        olderRate,
        decline,
      };
    }).filter(item => item.decline >= 20 && item.olderRate >= 30) // Only show significant declines
      .sort((a, b) => b.decline - a.decline);

    return { success: true, data: JSON.parse(JSON.stringify(declining)) };
  } catch (error: any) {
    console.error('Error getting declining attendance:', error);
    return { success: false, error: error.message };
  }
}

// ── Aggregate Attendance Trends ──────────────────────────────────────────────

export async function getAttendanceTrends(congregationId: string, months: number = 12) {
  try {
    await connectToDB();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await Attendance.find({
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    const monthlyData = new Map();

    records.forEach((record: any) => {
      const monthKey = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          totalMeetings: 0,
          midweekMeetings: 0,
          weekendMeetings: 0,
          totalAttendance: 0,
          midweekAttendance: 0,
          weekendAttendance: 0
        });
      }
      const data = monthlyData.get(monthKey);
      data.totalMeetings++;
      data.totalAttendance += record.attendance || 0;
      if (record.meetingType?.toLowerCase() === 'midweek') {
        data.midweekMeetings++;
        data.midweekAttendance += record.attendance || 0;
      } else {
        data.weekendMeetings++;
        data.weekendAttendance += record.attendance || 0;
      }
    });

    const trends = Array.from(monthlyData.values()).map(data => ({
      ...data,
      avgAttendance: data.totalMeetings > 0 ? Math.round(data.totalAttendance / data.totalMeetings) : 0,
      avgMidweek: data.midweekMeetings > 0 ? Math.round(data.midweekAttendance / data.midweekMeetings) : 0,
      avgWeekend: data.weekendMeetings > 0 ? Math.round(data.weekendAttendance / data.weekendMeetings) : 0
    }));

    return { success: true, data: JSON.parse(JSON.stringify(trends)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceComparison(congregationId: string) {
  try {
    await connectToDB();

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const records = await Attendance.find({
      date: { $gte: threeMonthsAgo }
    }).lean();

    const midweekRecords = records.filter((r: any) => r.meetingType?.toLowerCase() === 'midweek');
    const weekendRecords = records.filter((r: any) => r.meetingType?.toLowerCase() === 'weekend');

    const midweekAvg = midweekRecords.length > 0
      ? Math.round(midweekRecords.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / midweekRecords.length)
      : 0;

    const weekendAvg = weekendRecords.length > 0
      ? Math.round(weekendRecords.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / weekendRecords.length)
      : 0;

    // Count unique attendees from individual records
    const recentIndividualRecords = await MemberAttendance.find({
      meetingDate: { $gte: threeMonthsAgo },
      present: true
    }).lean();

    const midweekAttendees = new Set(
      recentIndividualRecords.filter(r => r.meetingType === 'Midweek').map(r => r.memberId.toString())
    );
    const weekendAttendees = new Set(
      recentIndividualRecords.filter(r => r.meetingType === 'Weekend').map(r => r.memberId.toString())
    );

    return {
      success: true,
      data: {
        midweek: {
          totalMeetings: midweekRecords.length,
          avgAttendance: midweekAvg,
          uniqueAttendees: midweekAttendees.size
        },
        weekend: {
          totalMeetings: weekendRecords.length,
          avgAttendance: weekendAvg,
          uniqueAttendees: weekendAttendees.size
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceStats(congregationId: string) {
  try {
    await connectToDB();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const records = await Attendance.find({
      date: { $gte: oneMonthAgo }
    }).lean();

    const totalMembers = await Member.countDocuments({});

    const avgAttendance = records.length > 0
      ? Math.round(records.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / records.length)
      : 0;

    // Count unique attendees from individual records
    const individualRecords = await MemberAttendance.find({
      meetingDate: { $gte: oneMonthAgo },
      present: true
    }).distinct('memberId');

    const attendanceRate = totalMembers > 0 ? Math.round((avgAttendance / totalMembers) * 100) : 0;

    return {
      success: true,
      data: {
        totalMeetings: records.length,
        avgAttendance,
        uniqueAttendees: individualRecords.length,
        totalMembers,
        attendanceRate
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── Record Individual Attendance ─────────────────────────────────────────────

async function _recordMemberAttendance(user: User, data: {
  meetingDate: string;
  meetingType: 'Midweek' | 'Weekend';
  members: Array<{ memberId: string; status: 'present' | 'late' | 'absent'; arrivalTime?: string }>;
}) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const meetingDate = new Date(data.meetingDate);

    // Remove existing records for this date (to allow re-recording)
    await MemberAttendance.deleteMany({ meetingDate });

    // Create records for all members with their status
    const presentMembers = data.members.filter(m => m.status !== 'absent');
    if (presentMembers.length > 0) {
      const records = presentMembers.map(member => ({
        memberId: member.memberId,
        meetingDate,
        meetingType: data.meetingType,
        present: true,
        status: member.status,
        arrivalTime: member.arrivalTime || null,
        createdBy: user._id,
      }));

      await MemberAttendance.insertMany(records, { ordered: false });
    }

    revalidatePath('/dashboard/attendance');
    return { success: true, count: presentMembers.length, lateCount: presentMembers.filter(m => m.status === 'late').length };
  } catch (error: any) {
    console.error('Error recording member attendance:', error);
    throw error;
  }
}

async function _getMemberAttendanceForDate(user: User, date: string) {
  try {
    if (!user) throw new Error('User not authorized');
    await connectToDB();

    const meetingDate = new Date(date);
    const startOfDay = new Date(meetingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(meetingDate.setHours(23, 59, 59, 999));

    const records = await MemberAttendance.find({
      meetingDate: { $gte: startOfDay, $lte: endOfDay },
      present: true
    }).select('memberId').lean();

    return records.map((r: any) => r.memberId.toString());
  } catch (error: any) {
    console.error('Error getting member attendance for date:', error);
    throw error;
  }
}

export const recordMemberAttendance = await withAuth(_recordMemberAttendance);
export const getMemberAttendanceForDate = await withAuth(_getMemberAttendanceForDate);
