"use server"

import { User, withAuth } from "../helpers/auth";
import FieldServiceReport from "../models/field-service.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";

async function _getMonthlyReport(user: User, month: number, year: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Format dates for month string comparison (YYYY-MM)
        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const sixMonthsAgoStr = `${year}-${(month - 6).toString().padStart(2, '0')}`;

        // Get all active publishers (reported at least once in last 6 months)
        const activePublishers = await FieldServiceReport.distinct("publisher", {
            month: { $gte: sixMonthsAgoStr, $lte: monthStr }
        });

        // Get current month reports
        const monthlyReports = await FieldServiceReport.find({
            month: monthStr
        }).populate("publisher");

        // Get regular pioneers from privileges
        const regularPioneers = await Member.find({})
            .populate("privileges")
            .then(members => members.filter(member =>
                member.privileges.some((privilege: any) =>
                    privilege.name.toLowerCase() === "regular pioneer"
                )
            ));

        const regularPioneerReports = monthlyReports.filter(r =>
            regularPioneers.some(p => p._id.toString() === r.publisher._id.toString())
        );

        const auxiliaryPioneerReports = monthlyReports.filter(r => r.auxiliaryPioneer);
        
        // Publishers (excluding auxiliary and regular pioneers)
        const publisherReports = monthlyReports.filter(r => 
            !r.auxiliaryPioneer && 
            !regularPioneers.some(p => p._id.toString() === r.publisher._id.toString())
        );

        console.log(regularPioneerReports, "regular pioneer reports")

        const stats = {
            activePublishers: activePublishers.length,
            publishers: {
                reports: publisherReports.length,
                bibleStudies: publisherReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
            },
            auxiliaryPioneers: {
                reports: auxiliaryPioneerReports.length,
                hours: auxiliaryPioneerReports.reduce((sum, r) => sum + (r.hours || 0), 0),
                bibleStudies: auxiliaryPioneerReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
            },
            regularPioneers: {
                reports: regularPioneerReports.length,
                hours: regularPioneerReports.reduce((sum, r) => sum + (r.hours || 0), 0),
                bibleStudies: regularPioneerReports.reduce((sum, r) => sum + (r.bibleStudents || 0), 0)
            }
        };

        console.log(JSON.parse(JSON.stringify(stats)))

        return JSON.parse(JSON.stringify(stats));
    } catch (error) {
        console.log("Error fetching monthly report:", error);
        throw error;
    }
}

async function _getMembersNeedingHelp(user: User, month: number, year: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        // Get all members (not just active publishers)
        const allMembers = await Member.find({})
            .populate('groupId', 'name')
            .select('fullName groupId status')
            .lean();

        // Get members who submitted reports this month
        const reportsThisMonth = await FieldServiceReport.find({ month: monthStr })
            .select('publisher bibleStudents')
            .lean();

        const reportedMemberIds = new Set(reportsThisMonth.map(r => r.publisher.toString()));
        const membersWithStudies = new Set(
            reportsThisMonth
                .filter(r => (r.bibleStudents || 0) > 0)
                .map(r => r.publisher.toString())
        );

        // Find members needing help
        const membersNeedingHelp = allMembers.map(member => {
            const memberId = member._id.toString();
            const noReport = !reportedMemberIds.has(memberId);
            const noStudy = !membersWithStudies.has(memberId);

            return {
                _id: member._id.toString(),
                fullName: member.fullName,
                groupName: (member.groupId as any)?.name || 'No Group',
                status: member.status,
                issues: {
                    noReport,
                    noStudy
                }
            };
        }).filter(member => member.issues.noReport || member.issues.noStudy);

        return JSON.parse(JSON.stringify(membersNeedingHelp));
    } catch (error) {
        console.log("Error fetching members needing help:", error);
        throw error;
    }
}

export const getMonthlyReport = await withAuth(_getMonthlyReport);
export const getMembersNeedingHelp = await withAuth(_getMembersNeedingHelp);