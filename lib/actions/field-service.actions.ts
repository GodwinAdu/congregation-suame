"use server"

import { User, withAuth } from "../helpers/auth";
import FieldServiceReport from "../models/field-service.models";
import Member from "../models/user.models";
import Group from "../models/group.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createFieldServiceReport(user: User, values: {
    publisher: string;
    month: string;
    hours?: number;
    bibleStudents: number;
    auxiliaryPioneer?: boolean;
    comments?: string;
    check?: boolean;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Check if report already exists for this publisher and month
        const existingReport = await FieldServiceReport.findOne({
            publisher: values.publisher,
            month: values.month
        });

        if (existingReport) {
            throw new Error("Report already exists for this month");
        }

        const newReport = new FieldServiceReport({
            publisher: values.publisher,
            month: values.month,
            hours: values.hours || 0,
            bibleStudents: values.bibleStudents,
            auxiliaryPioneer: values.auxiliaryPioneer || false,
            comments: values.comments,
            check: values.check || false
        });

        await newReport.save();

        await logActivity({
            userId: user._id as string,
            type: 'report_submit',
            action: `${user.fullName} submitted field service report for ${values.month}`,
            details: { entityId: newReport._id, entityType: 'FieldServiceReport' },
        });

        revalidatePath('/dashboard/manage-report');
        return JSON.parse(JSON.stringify(newReport));

    } catch (error) {
        console.log("Error creating field service report:", error);
        throw error;
    }
}

async function _fetchReportsByMonth(user: User, month: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const reports = await FieldServiceReport.find({ month })
            .populate('publisher', 'firstName lastName')
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(reports));
    } catch (error) {
        console.log("Error fetching reports by month:", error);
        throw error;
    }
}

async function _fetchAllReports(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const reports = await FieldServiceReport.find({})
            .populate('publisher', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(100);

        return JSON.parse(JSON.stringify(reports));
    } catch (error) {
        console.log("Error fetching all reports:", error);
        throw error;
    }
}

async function _fetchAllMembers(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({})
            .select('firstName lastName')
            .sort({ firstName: 1 });

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("Error fetching members:", error);
        throw error;
    }
}

async function _fetchMembersWithReportStatus(user: User, month: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({})
            .select('fullName phone privileges groupId')
            .populate('privileges', 'name')
            .populate('groupId', 'name')
            .sort({ fullName: 1 });

        const reports = await FieldServiceReport.find({ month })
            .select('publisher _id')
            .lean();

        const reportMap = new Map(reports.map(r => [r.publisher.toString(), r._id.toString()]));

        // Import SMSLog dynamically to avoid circular dependency
        const SMSLog = (await import('../models/sms-log.models')).default;
        const smsLogs = await SMSLog.find({ month }).select('recipient').lean();
        const smsCountMap = new Map<string, number>();
        smsLogs.forEach((log: any) => {
            const id = log.recipient.toString();
            smsCountMap.set(id, (smsCountMap.get(id) || 0) + 1);
        });

        const membersWithStatus = members.map(member => ({
            ...member.toObject(),
            hasReported: reportMap.has(member._id.toString()),
            reportId: reportMap.get(member._id.toString()) || null,
            smsCount: smsCountMap.get(member._id.toString()) || 0,
            month
        }));

        return JSON.parse(JSON.stringify(membersWithStatus));
    } catch (error) {
        console.log("Error fetching members with report status:", error);
        throw error;
    }
}

async function _fetchMembersWithGroupStatus(user: User, month: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const groupId = user.groupId;

        const members = await Member.find({ groupId })
            .select('fullName privileges')
            .populate('privileges', 'name')
            .sort({ fullName: 1 });

        const reports = await FieldServiceReport.find({ month })
            .select('publisher _id')
            .lean();

        const reportMap = new Map(reports.map(r => [r.publisher.toString(), r._id.toString()]));

        const membersWithStatus = members.map(member => ({
            ...member.toObject(),
            hasReported: reportMap.has(member._id.toString()),
            reportId: reportMap.get(member._id.toString()) || null,
            month
        }));

        return JSON.parse(JSON.stringify(membersWithStatus));
    } catch (error) {
        console.log("Error fetching members with report status:", error);
        throw error;
    }
}

async function _fetchReportById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const report = await FieldServiceReport.findById(id)
            .populate('publisher', 'fullName privileges')
            .populate('publisher.privileges', 'name');

        if (!report) throw new Error("Report not found");

        return JSON.parse(JSON.stringify(report));
    } catch (error) {
        console.log("Error fetching report:", error);
        throw error;
    }
}

async function _updateFieldServiceReport(user: User, id: string, values: {
    hours?: number;
    bibleStudents?: number;
    auxiliaryPioneer?: boolean;
    comments?: string;
    check?: boolean;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedReport = await FieldServiceReport.findByIdAndUpdate(
            id,
            values,
            { new: true, runValidators: false }
        );

        if (!updatedReport) throw new Error("Report not found");

        await logActivity({
            userId: user._id as string,
            type: 'report_update',
            action: `${user.fullName} updated field service report`,
            details: { entityId: id, entityType: 'FieldServiceReport' },
        });

        revalidatePath('/dashboard/manage-report');
        return JSON.parse(JSON.stringify(updatedReport));
    } catch (error) {
        console.log("Error updating field service report:", error);
        throw error;
    }
}

async function _fetchMemberReports(user: User, memberId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findById(memberId)
            .select('fullName email phone gender dob address emergencyContact role groupId privileges createdAt')
            .populate('groupId', 'name')
            .populate('privileges', 'name');

        if (!member) throw new Error("Member not found");

        const reports = await FieldServiceReport.find({ publisher: memberId })
            .sort({ month: -1 })
            .lean();

        return JSON.parse(JSON.stringify({ member, reports }));
    } catch (error) {
        console.log("Error fetching member reports:", error);
        throw error;
    }
}

async function _fetchAllGroups(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const groups = await Group.find({})
            .select('name')
            .sort({ name: 1 });

        return JSON.parse(JSON.stringify(groups));
    } catch (error) {
        console.log("Error fetching groups:", error);
        throw error;
    }
}

export const createFieldServiceReport = await withAuth(_createFieldServiceReport);
export const fetchReportsByMonth = await withAuth(_fetchReportsByMonth);
export const fetchAllReports = await withAuth(_fetchAllReports);
export const fetchAllMembers = await withAuth(_fetchAllMembers);
export const updateFieldServiceReport = await withAuth(_updateFieldServiceReport);
export const fetchMembersWithReportStatus = await withAuth(_fetchMembersWithReportStatus);
export const fetchMembersWithGroupStatus = await withAuth(_fetchMembersWithGroupStatus);
export const fetchReportById = await withAuth(_fetchReportById);
export const fetchMemberReports = await withAuth(_fetchMemberReports);
export const fetchAllGroups = await withAuth(_fetchAllGroups);


async function _fetchMembersNeedingHelp(user: User, month: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Generate last 6 months excluding current month
        const targetDate = new Date(month + '-01');
        const months: string[] = [];
        for (let i = 6; i >= 1; i--) {
            const d = new Date(targetDate);
            d.setMonth(d.getMonth() - i);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        const members = await Member.find({})
            .select('fullName phone privileges groupId')
            .populate('privileges', 'name')
            .populate('groupId', 'name')
            .sort({ 'groupId.name': 1, fullName: 1 });

        // Fetch all reports for the last 6 months
        const reports = await FieldServiceReport.find({ month: { $in: months } })
            .select('publisher month bibleStudents _id')
            .lean();

        // Build history map: memberId -> { month -> { id, bibleStudents } }
        const historyMap = new Map<string, Map<string, { id: string; bibleStudents: number }>>();
        reports.forEach(r => {
            const memberId = r.publisher.toString();
            if (!historyMap.has(memberId)) {
                historyMap.set(memberId, new Map());
            }
            historyMap.get(memberId)!.set(r.month, {
                id: r._id.toString(),
                bibleStudents: r.bibleStudents || 0
            });
        });

        const membersNeedingHelp = members
            .map(member => {
                const memberId = member._id.toString();
                const history = historyMap.get(memberId) || new Map();

                // Analyze 6-month history
                const reportedMonths = months.filter(m => history.has(m));
                const missedMonths = months.filter(m => !history.has(m));
                const monthsWithStudents = reportedMonths.filter(m => (history.get(m)?.bibleStudents || 0) > 0);
                const monthsWithoutStudents = reportedMonths.filter(m => (history.get(m)?.bibleStudents || 0) === 0);

                // Current month data
                const currentReport = history.get(month);
                const hasReportedThisMonth = !!currentReport;
                const currentBibleStudents = currentReport?.bibleStudents || 0;

                // Categorization logic
                let category: 'consistently-not-reporting' | 'no-bible-students' | 'irregular' | null = null;
                let needsHelp = false;

                // Consistently Not Reporting: missed 3+ of last 6 months
                if (missedMonths.length >= 3) {
                    category = 'consistently-not-reporting';
                    needsHelp = true;
                }
                // No Bible Students: reported at least 4 months but 0 students in all reports
                else if (reportedMonths.length >= 4 && monthsWithStudents.length === 0) {
                    category = 'no-bible-students';
                    needsHelp = true;
                }
                // Irregular: has gaps (missed 1-2 months) or inconsistent bible students
                else if (missedMonths.length >= 1 && missedMonths.length < 3) {
                    category = 'irregular';
                    needsHelp = true;
                }
                // Also flag as irregular if they report but bible students fluctuate between 0 and >0
                else if (reportedMonths.length >= 4 && monthsWithoutStudents.length >= 2 && monthsWithStudents.length >= 1) {
                    category = 'irregular';
                    needsHelp = true;
                }

                if (!needsHelp) return null;

                return {
                    ...member.toObject(),
                    hasReported: hasReportedThisMonth,
                    bibleStudents: currentBibleStudents,
                    reportId: currentReport?.id || null,
                    category,
                    reportedMonths: reportedMonths.length,
                    missedMonths: missedMonths.length,
                    monthsWithStudents: monthsWithStudents.length,
                    helpReason: category === 'consistently-not-reporting' 
                        ? 'Consistently Not Reporting' 
                        : category === 'no-bible-students' 
                        ? 'No Bible Students' 
                        : 'Irregular Reporter',
                    month
                };
            })
            .filter(m => m !== null);

        return JSON.parse(JSON.stringify(membersNeedingHelp));
    } catch (error) {
        console.log("Error fetching members needing help:", error);
        throw error;
    }
}

export const fetchMembersNeedingHelp = await withAuth(_fetchMembersNeedingHelp);
