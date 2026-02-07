'use server';

import { connectToDB } from '@/lib/mongoose';
import Attendance from '@/lib/models/attendance.models';
import Member from '@/lib/models/user.models';
import mongoose from 'mongoose';

export async function getAttendanceAnalytics(congregationId: string, months: number = 6) {
  try {
    await connectToDB();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate }
    }).lean();

    const memberAttendance = new Map();

    attendanceRecords.forEach(record => {
      record.attendees?.forEach((attendee: any) => {
        const memberId = attendee.memberId?.toString() || attendee.toString();
        if (!memberAttendance.has(memberId)) {
          memberAttendance.set(memberId, {
            memberId,
            totalMeetings: 0,
            midweekCount: 0,
            weekendCount: 0,
            attendedMeetings: 0,
            midweekAttended: 0,
            weekendAttended: 0,
            lastAttendance: null
          });
        }
        const data = memberAttendance.get(memberId);
        data.attendedMeetings++;
        data.lastAttendance = record.date;
        if (record.meetingType === 'midweek') {
          data.midweekAttended++;
        } else {
          data.weekendAttended++;
        }
      });

      const meetingType = record.meetingType;
      memberAttendance.forEach((data) => {
        data.totalMeetings++;
        if (meetingType === 'midweek') {
          data.midweekCount++;
        } else {
          data.weekendCount++;
        }
      });
    });

    const analytics = Array.from(memberAttendance.values()).map(data => ({
      ...data,
      attendanceRate: data.totalMeetings > 0 ? Math.round((data.attendedMeetings / data.totalMeetings) * 100) : 0,
      midweekRate: data.midweekCount > 0 ? Math.round((data.midweekAttended / data.midweekCount) * 100) : 0,
      weekendRate: data.weekendCount > 0 ? Math.round((data.weekendAttended / data.weekendCount) * 100) : 0
    }));

    const members = await Member.find({
      _id: { $in: Array.from(memberAttendance.keys()) }
    }).select('firstName lastName email').lean();

    const result = analytics.map(a => {
      const member = members.find(m => m._id.toString() === a.memberId);
      return { ...a, member };
    });

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDecliningAttendance(congregationId: string) {
  try {
    await connectToDB();

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRecords = await Attendance.find({
      date: { $gte: threeMonthsAgo }
    }).lean();

    const olderRecords = await Attendance.find({
      date: { $gte: sixMonthsAgo, $lt: threeMonthsAgo }
    }).lean();

    const calculateRate = (records: any[], memberId: string) => {
      let total = 0;
      let attended = 0;
      records.forEach(record => {
        total++;
        if (record.attendees?.some((a: any) => (a.memberId?.toString() || a.toString()) === memberId)) {
          attended++;
        }
      });
      return total > 0 ? (attended / total) * 100 : 0;
    };

    const members = await Member.find({}).select('firstName lastName email').lean();

    const declining = members.map(member => {
      const memberId = member._id.toString();
      const recentRate = calculateRate(recentRecords, memberId);
      const olderRate = calculateRate(olderRecords, memberId);
      const decline = olderRate - recentRate;

      return {
        member,
        recentRate: Math.round(recentRate),
        olderRate: Math.round(olderRate),
        decline: Math.round(decline)
      };
    }).filter(m => m.decline > 20).sort((a, b) => b.decline - a.decline);

    return { success: true, data: JSON.parse(JSON.stringify(declining)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAttendanceTrends(congregationId: string, months: number = 12) {
  try {
    await connectToDB();

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const records = await Attendance.find({
      date: { $gte: startDate }
    }).sort({ date: 1 }).lean();

    const monthlyData = new Map();

    records.forEach(record => {
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
      data.totalAttendance += record.attendees?.length || 0;
      if (record.meetingType === 'midweek') {
        data.midweekMeetings++;
        data.midweekAttendance += record.attendees?.length || 0;
      } else {
        data.weekendMeetings++;
        data.weekendAttendance += record.attendees?.length || 0;
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

    const midweekRecords = records.filter(r => r.meetingType === 'midweek');
    const weekendRecords = records.filter(r => r.meetingType === 'weekend');

    const midweekAvg = midweekRecords.length > 0
      ? Math.round(midweekRecords.reduce((sum, r) => sum + (r.attendees?.length || 0), 0) / midweekRecords.length)
      : 0;

    const weekendAvg = weekendRecords.length > 0
      ? Math.round(weekendRecords.reduce((sum, r) => sum + (r.attendees?.length || 0), 0) / weekendRecords.length)
      : 0;

    const midweekUnique = new Set();
    midweekRecords.forEach(r => {
      r.attendees?.forEach((a: any) => midweekUnique.add(a.memberId?.toString() || a.toString()));
    });

    const weekendUnique = new Set();
    weekendRecords.forEach(r => {
      r.attendees?.forEach((a: any) => weekendUnique.add(a.memberId?.toString() || a.toString()));
    });

    return {
      success: true,
      data: {
        midweek: {
          totalMeetings: midweekRecords.length,
          avgAttendance: midweekAvg,
          uniqueAttendees: midweekUnique.size
        },
        weekend: {
          totalMeetings: weekendRecords.length,
          avgAttendance: weekendAvg,
          uniqueAttendees: weekendUnique.size
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

    const uniqueAttendees = new Set();
    records.forEach(r => {
      r.attendees?.forEach((a: any) => uniqueAttendees.add(a.memberId?.toString() || a.toString()));
    });

    const avgAttendance = records.length > 0
      ? Math.round(records.reduce((sum, r) => sum + (r.attendees?.length || 0), 0) / records.length)
      : 0;

    const attendanceRate = totalMembers > 0 ? Math.round((uniqueAttendees.size / totalMembers) * 100) : 0;

    return {
      success: true,
      data: {
        totalMeetings: records.length,
        avgAttendance,
        uniqueAttendees: uniqueAttendees.size,
        totalMembers,
        attendanceRate
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
