"use server"

import { User, withAuth } from "../helpers/auth";
import { connectToDB } from "../mongoose";
import Member from "../models/user.models";
import FieldServiceReport from "../models/field-service.models";
import Attendance from "../models/attendance.models";
import Group from "../models/group.models";

async function _getCOVisitPreparation(user: User, months: number = 6) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
        const startMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // 1. Congregation overview
        const totalMembers = await Member.countDocuments({});
        const groups = await Group.find({}).lean();
        const membersByGroup = await Member.aggregate([
            { $group: { _id: "$groupId", count: { $sum: 1 } } }
        ]);

        // 2. Field service statistics (last 6 months)
        const reports = await FieldServiceReport.find({
            month: { $gte: startMonthStr, $lte: currentMonthStr }
        }).lean();

        const monthlyReportCounts: Record<string, number> = {};
        const monthlyHours: Record<string, number> = {};
        const monthlyStudies: Record<string, number> = {};

        reports.forEach((r: any) => {
            monthlyReportCounts[r.month] = (monthlyReportCounts[r.month] || 0) + 1;
            monthlyHours[r.month] = (monthlyHours[r.month] || 0) + (r.hours || 0);
            monthlyStudies[r.month] = (monthlyStudies[r.month] || 0) + (r.bibleStudents || 0);
        });

        const totalHours = reports.reduce((sum, r: any) => sum + (r.hours || 0), 0);
        const totalStudies = reports.reduce((sum, r: any) => sum + (r.bibleStudents || 0), 0);
        const avgReportsPerMonth = Object.keys(monthlyReportCounts).length > 0
            ? Math.round(Object.values(monthlyReportCounts).reduce((a, b) => a + b, 0) / Object.keys(monthlyReportCounts).length)
            : 0;

        // 3. Pioneer data
        const regularPioneers = await Member.find({ pioneerStatus: 'regular' })
            .select('fullName phone').lean();
        const auxiliaryCount = await FieldServiceReport.distinct('publisher', {
            month: { $gte: startMonthStr },
            auxiliaryPioneer: true
        });

        // 4. Attendance statistics
        const attendanceRecords = await Attendance.find({
            date: { $gte: startDate }
        }).sort({ date: 1 }).lean();

        const midweekRecords = attendanceRecords.filter((r: any) => r.meetingType === 'Midweek');
        const weekendRecords = attendanceRecords.filter((r: any) => r.meetingType === 'Weekend');

        const avgMidweek = midweekRecords.length > 0
            ? Math.round(midweekRecords.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / midweekRecords.length)
            : 0;
        const avgWeekend = weekendRecords.length > 0
            ? Math.round(weekendRecords.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / weekendRecords.length)
            : 0;

        // 5. Inactive publishers (no report in 3+ months)
        const threeMonthsAgoStr = `${new Date(now.getFullYear(), now.getMonth() - 3, 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - 3, 1).getMonth() + 1).padStart(2, '0')}`;
        const recentReporters = await FieldServiceReport.distinct('publisher', {
            month: { $gte: threeMonthsAgoStr }
        });
        const inactiveCount = totalMembers - recentReporters.length;

        // 6. Members needing shepherding (no report in current month + previous)
        const prevMonthStr = `${new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear()}-${String(new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth() + 1).padStart(2, '0')}`;
        const membersNotReporting = await Member.find({
            _id: { $nin: recentReporters }
        }).select('fullName phone groupId').populate('groupId', 'name').lean();

        // 7. Monthly trends
        const monthlyTrends = Object.keys(monthlyReportCounts).sort().map(month => ({
            month,
            reports: monthlyReportCounts[month] || 0,
            hours: monthlyHours[month] || 0,
            studies: monthlyStudies[month] || 0,
            reportingRate: totalMembers > 0 ? Math.round((monthlyReportCounts[month] / totalMembers) * 100) : 0
        }));

        return {
            overview: {
                totalMembers,
                totalGroups: groups.length,
                regularPioneers: regularPioneers.length,
                auxiliaryPioneersUnique: auxiliaryCount.length,
                inactiveCount,
            },
            fieldService: {
                totalHours,
                totalStudies,
                avgReportsPerMonth,
                reportingRate: totalMembers > 0
                    ? Math.round((avgReportsPerMonth / totalMembers) * 100)
                    : 0,
                monthlyTrends,
            },
            attendance: {
                avgMidweek,
                avgWeekend,
                avgOverall: Math.round((avgMidweek + avgWeekend) / 2),
                totalMeetings: attendanceRecords.length,
            },
            pioneers: {
                regularPioneers: JSON.parse(JSON.stringify(regularPioneers)),
                auxiliaryCount: auxiliaryCount.length,
            },
            shepherding: {
                membersNotReporting: JSON.parse(JSON.stringify(membersNotReporting.slice(0, 20))),
                totalNeedingAttention: membersNotReporting.length,
            },
            groups: JSON.parse(JSON.stringify(groups.map(g => {
                const memberCount = membersByGroup.find((mg: any) => mg._id?.toString() === g._id.toString())?.count || 0;
                return { _id: g._id, name: (g as any).name, memberCount };
            }))),
            generatedAt: new Date().toISOString(),
            periodMonths: months,
        };
    } catch (error) {
        console.error("Error generating CO visit preparation:", error);
        throw error;
    }
}

export const getCOVisitPreparation = await withAuth(_getCOVisitPreparation);
