"use server"

import { User, withAuth } from "../helpers/auth";
import FieldServiceReport from "../models/field-service.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createFieldServiceReport(user: User, values: {
    publisher: string;
    month: string;
    hours?: number;
    bibleStudents: number;
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
            comments: values.comments,
            check: values.check || false
        });

        await newReport.save();
        
        await logActivity({
            userId: user._id,
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
            userId: user._id,
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

export const createFieldServiceReport = await withAuth(_createFieldServiceReport);
export const fetchReportsByMonth = await withAuth(_fetchReportsByMonth);
export const fetchAllReports = await withAuth(_fetchAllReports);
export const fetchAllMembers = await withAuth(_fetchAllMembers);
export const updateFieldServiceReport = await withAuth(_updateFieldServiceReport);
export const fetchMembersWithReportStatus = await withAuth(_fetchMembersWithReportStatus);
export const fetchMembersWithGroupStatus = await withAuth(_fetchMembersWithGroupStatus);
export const fetchReportById = await withAuth(_fetchReportById);