"use server"

import { User, withAuth } from "../helpers/auth";
import { connectToDB } from "../mongoose";
import Member from "../models/user.models";
import FieldServiceReport from "../models/field-service.models";
import Attendance from "../models/attendance.models";

async function _getDashboardAlerts(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

        // 1. Unchecked reports for current month
        const uncheckedReports = await FieldServiceReport.countDocuments({
            month: currentMonth,
            check: false
        });

        // 2. Members who haven't submitted this month
        const totalMembers = await Member.countDocuments({});
        const submittedThisMonth = await FieldServiceReport.distinct('publisher', { month: currentMonth });
        const notSubmittedCount = totalMembers - submittedThisMonth.length;

        // 3. Previous month reports still unchecked (urgent if past 10th)
        const prevUnchecked = await FieldServiceReport.countDocuments({
            month: prevMonthStr,
            check: false
        });

        // 4. Upcoming assignments (next 7 days) — check if Assignment model exists
        let upcomingAssignments = 0;
        try {
            const Assignment = (await import('../models/assignment.models')).default;
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            upcomingAssignments = await Assignment.countDocuments({
                date: { $gte: now, $lte: nextWeek }
            });
        } catch { /* Assignment model may not exist */ }

        // 5. Members with no report in last 3 months (inactive risk)
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const threeMonthsAgoStr = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
        const activeReporters = await FieldServiceReport.distinct('publisher', {
            month: { $gte: threeMonthsAgoStr }
        });
        const inactiveRisk = totalMembers - activeReporters.length;

        // 6. Attendance average this month vs last month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthAttendance = await Attendance.find({ date: { $gte: thisMonthStart } }).lean();
        const lastMonthAttendance = await Attendance.find({
            date: { $gte: lastMonthStart, $lt: thisMonthStart }
        }).lean();

        const thisMonthAvg = thisMonthAttendance.length > 0
            ? Math.round(thisMonthAttendance.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / thisMonthAttendance.length)
            : 0;
        const lastMonthAvg = lastMonthAttendance.length > 0
            ? Math.round(lastMonthAttendance.reduce((sum, r: any) => sum + (r.attendance || 0), 0) / lastMonthAttendance.length)
            : 0;

        const attendanceTrend = lastMonthAvg > 0
            ? Math.round(((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100)
            : 0;

        // Build alerts array
        const alerts: Array<{
            id: string;
            type: 'warning' | 'info' | 'urgent' | 'success';
            title: string;
            message: string;
            count: number;
            action?: string;
            link?: string;
        }> = [];

        if (uncheckedReports > 0) {
            alerts.push({
                id: 'unchecked-reports',
                type: 'warning',
                title: 'Reports Pending Review',
                message: `${uncheckedReports} reports submitted this month need your verification`,
                count: uncheckedReports,
                action: 'Review Reports',
                link: '/dashboard/field-service/review'
            });
        }

        if (prevUnchecked > 0 && now.getDate() > 5) {
            alerts.push({
                id: 'prev-unchecked',
                type: 'urgent',
                title: 'Previous Month Reports Unchecked',
                message: `${prevUnchecked} reports from last month still need verification`,
                count: prevUnchecked,
                action: 'Review Now',
                link: '/dashboard/field-service/review'
            });
        }

        if (notSubmittedCount > 5 && now.getDate() >= 20) {
            alerts.push({
                id: 'not-submitted',
                type: 'info',
                title: 'Reports Not Yet Submitted',
                message: `${notSubmittedCount} members haven't submitted their report for this month`,
                count: notSubmittedCount,
                action: 'View Members',
                link: '/dashboard/manage-report'
            });
        }

        if (inactiveRisk > 3) {
            alerts.push({
                id: 'inactive-risk',
                type: 'warning',
                title: 'Inactive Risk',
                message: `${inactiveRisk} members haven't reported in 3+ months — may need shepherding`,
                count: inactiveRisk,
                action: 'View Inactive',
                link: '/dashboard/field-service/inactive-publishers'
            });
        }

        if (upcomingAssignments > 0) {
            alerts.push({
                id: 'upcoming-assignments',
                type: 'info',
                title: 'Upcoming Assignments',
                message: `${upcomingAssignments} assignments scheduled in the next 7 days`,
                count: upcomingAssignments,
                action: 'View Assignments',
                link: '/dashboard/assignments'
            });
        }

        if (attendanceTrend < -10 && lastMonthAvg > 0) {
            alerts.push({
                id: 'attendance-decline',
                type: 'warning',
                title: 'Attendance Declining',
                message: `Average attendance is down ${Math.abs(attendanceTrend)}% compared to last month`,
                count: Math.abs(attendanceTrend),
                action: 'View Analytics',
                link: '/dashboard/attendance/analytics'
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                id: 'all-good',
                type: 'success',
                title: 'Everything Looks Good',
                message: 'No urgent items need your attention right now',
                count: 0
            });
        }

        return {
            alerts,
            summary: {
                totalMembers,
                submittedThisMonth: submittedThisMonth.length,
                uncheckedReports,
                notSubmittedCount,
                thisMonthAvg,
                attendanceTrend,
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard alerts:", error);
        throw error;
    }
}

export const getDashboardAlerts = await withAuth(_getDashboardAlerts);
