'use server';

import { connectToDB } from '@/lib/mongoose';
import Attendance from '@/lib/models/attendance.models';
import Member from '@/lib/models/user.models';
import mongoose from 'mongoose';

export async function getAttendanceAnalytics(congregationId: string, months: number = 6) {
  try {
    await connectToDB();
    // This system tracks aggregate attendance counts, not individual member attendance
    // Return empty array since individual member analytics are not available
    return { success: true, data: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDecliningAttendance(congregationId: string) {
  try {
    await connectToDB();
    // This system tracks aggregate attendance counts, not individual member attendance
    // Return empty array since individual declining analytics are not available
    return { success: true, data: [] };
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

    const midweekRecords = records.filter(r => r.meetingType?.toLowerCase() === 'midweek');
    const weekendRecords = records.filter(r => r.meetingType?.toLowerCase() === 'weekend');

    const midweekAvg = midweekRecords.length > 0
      ? Math.round(midweekRecords.reduce((sum, r) => sum + (r.attendance || 0), 0) / midweekRecords.length)
      : 0;

    const weekendAvg = weekendRecords.length > 0
      ? Math.round(weekendRecords.reduce((sum, r) => sum + (r.attendance || 0), 0) / weekendRecords.length)
      : 0;

    return {
      success: true,
      data: {
        midweek: {
          totalMeetings: midweekRecords.length,
          avgAttendance: midweekAvg,
          uniqueAttendees: 0
        },
        weekend: {
          totalMeetings: weekendRecords.length,
          avgAttendance: weekendAvg,
          uniqueAttendees: 0
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
      ? Math.round(records.reduce((sum, r) => sum + (r.attendance || 0), 0) / records.length)
      : 0;

    const attendanceRate = totalMembers > 0 ? Math.round((avgAttendance / totalMembers) * 100) : 0;

    return {
      success: true,
      data: {
        totalMeetings: records.length,
        avgAttendance,
        uniqueAttendees: 0,
        totalMembers,
        attendanceRate
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
