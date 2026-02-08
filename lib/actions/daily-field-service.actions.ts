'use server';

import { connectToDB } from '@/lib/mongoose';
import { withAuth, User } from '@/lib/helpers/auth';
import DailyFieldServiceReport from '@/lib/models/daily-field-service.models';
import FieldServiceReport from '@/lib/models/field-service.models';

// Add daily report
const _addDailyReport = async (user: User, data: {
  date: string;
  sharedInMinistry?: boolean;
  hours: number;
  placements?: number;
  videos?: number;
  bibleStudyIds?: string[]; // IDs of Bible studies visited
  comments?: string;
}) => {
  try {
    if (!user) throw new Error('Unauthorized');
    await connectToDB();

    const reportDate = new Date(data.date);
    const month = reportDate.toISOString().slice(0, 7);

    // Create or update daily report
    const dailyReport = await DailyFieldServiceReport.findOneAndUpdate(
      { publisher: user._id, date: reportDate },
      {
        publisher: user._id,
        date: reportDate,
        month,
        sharedInMinistry: data.sharedInMinistry || false,
        hours: data.hours || 0,
        placements: data.placements || 0,
        videos: data.videos || 0,
        bibleStudyIds: data.bibleStudyIds || [],
        bibleStudies: (data.bibleStudyIds || []).length,
        comments: data.comments
      },
      { upsert: true, new: true }
    );

    // Auto-update monthly report
    await updateMonthlyReport(user._id as string, month);

    return { success: true, data: JSON.parse(JSON.stringify(dailyReport)) };
  } catch (error: any) {
    console.error('Error adding daily report:', error);
    return { success: false, error: error.message };
  }
};

// Get daily reports for a month
const _getDailyReports = async (user: User, month: string) => {
  try {
    if (!user) throw new Error('Unauthorized');
    await connectToDB();

    const dailyReports = await DailyFieldServiceReport.find({
      publisher: user._id,
      month
    }).sort({ date: 1 });

    return { success: true, data: JSON.parse(JSON.stringify(dailyReports)) };
  } catch (error: any) {
    console.error('Error fetching daily reports:', error);
    return { success: false, error: error.message };
  }
};

// Delete daily report
const _deleteDailyReport = async (user: User, reportId: string) => {
  try {
    if (!user) throw new Error('Unauthorized');
    await connectToDB();

    const report = await DailyFieldServiceReport.findOne({
      _id: reportId,
      publisher: user._id
    });

    if (!report) throw new Error('Report not found');

    const month = report.month;
    await report.deleteOne();

    // Auto-update monthly report
    await updateMonthlyReport(user._id as string, month);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting daily report:', error);
    return { success: false, error: error.message };
  }
};

// Get monthly summary with daily breakdown
const _getMonthlySummary = async (user: User, month: string) => {
  try {
    if (!user) throw new Error('Unauthorized');
    await connectToDB();

    const dailyReports = await DailyFieldServiceReport.find({
      publisher: user._id,
      month
    }).sort({ date: 1 });

    const monthlyReport = await FieldServiceReport.findOne({
      publisher: user._id,
      month
    });

    const totals = dailyReports.reduce((acc, report) => ({
      hours: acc.hours + (report.hours || 0),
      placements: acc.placements + (report.placements || 0),
      videos: acc.videos + (report.videos || 0),
      bibleStudies: acc.bibleStudies + (report.bibleStudies || 0)
    }), { hours: 0, placements: 0, videos: 0, bibleStudies: 0 });

    return {
      success: true,
      data: {
        dailyReports: JSON.parse(JSON.stringify(dailyReports)),
        monthlyReport: monthlyReport ? JSON.parse(JSON.stringify(monthlyReport)) : null,
        totals
      }
    };
  } catch (error: any) {
    console.error('Error fetching monthly summary:', error);
    return { success: false, error: error.message };
  }
};

// Helper: Update monthly report from daily reports
async function updateMonthlyReport(publisherId: string, month: string) {
  const dailyReports = await DailyFieldServiceReport.find({
    publisher: publisherId,
    month
  });

  // If no daily reports, DELETE the monthly report
  if (dailyReports.length === 0) {
    await FieldServiceReport.deleteOne({
      publisher: publisherId,
      month
    });
    return;
  }

  const totals = dailyReports.reduce((acc, report) => ({
    hours: acc.hours + (report.hours || 0),
    placements: acc.placements + (report.placements || 0),
    videos: acc.videos + (report.videos || 0),
    bibleStudies: acc.bibleStudies + (report.bibleStudies || 0)
  }), { hours: 0, placements: 0, videos: 0, bibleStudies: 0 });

  // Count UNIQUE Bible study IDs (same student multiple times = 1)
  const allBibleStudyIds = dailyReports
    .flatMap(report => report.bibleStudyIds || [])
    .filter(id => id);
  
  const uniqueBibleStudyIds = new Set(allBibleStudyIds);
  const uniqueBibleStudyCount = uniqueBibleStudyIds.size;

  // Count days shared in ministry
  const daysShared = dailyReports.filter(r => r.sharedInMinistry).length;

  await FieldServiceReport.findOneAndUpdate(
    { publisher: publisherId, month },
    {
      publisher: publisherId,
      month,
      hours: totals.hours,
      placements: totals.placements,
      videos: totals.videos,
      bibleStudents: uniqueBibleStudyCount, // Use unique count
      comments: `Auto-generated from ${dailyReports.length} daily reports (${daysShared} days shared, ${uniqueBibleStudyCount} unique Bible students)`
    },
    { upsert: true, new: true }
  );
}

export const addDailyReport = await withAuth(_addDailyReport);
export const getDailyReports = await withAuth(_getDailyReports);
export const deleteDailyReport = await withAuth(_deleteDailyReport);
export const getMonthlySummary = await withAuth(_getMonthlySummary);
