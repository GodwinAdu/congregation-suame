"use server"

import { User, withAuth } from "../helpers/auth";
import Member from "../models/user.models";
import Privilege from "../models/privilege.models";
import Group from "../models/group.models";
import Attendance from "../models/attendance.models";
import FieldServiceReport from "../models/field-service.models";
import { TransportFee, MemberFeePayment } from "../models/transport-fee.models";
import Activity from "../models/activity.models";
import { connectToDB } from "../mongoose";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

async function _fetchMemberAnalytics(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const [members, privileges] = await Promise.all([
            Member.find({})
                .populate('privileges', 'name')
                .populate('groupId', 'name')
                .lean(),
            Privilege.find({}).lean()
        ]);

        // Get privilege counts
        const privilegeCounts = privileges.map(privilege => {
            const count = members.filter(member => 
                member.privileges?.some((p: any) => p._id.toString() === privilege._id.toString())
            ).length;
            
            const membersWithPrivilege = members.filter(member => 
                member.privileges?.some((p: any) => p._id.toString() === privilege._id.toString())
            );

            return {
                _id: privilege._id,
                name: privilege.name,
                count,
                members: membersWithPrivilege.map((m: any) => ({
                    _id: m._id,
                    fullName: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    groupId: m.groupId
                }))
            };
        });

        // Get role counts
        const roleCounts = [
            {
                name: 'Publishers',
                count: members.filter(m => m.role === 'publisher').length,
                members: members.filter(m => m.role === 'publisher').map((m: any) => ({
                    _id: m._id,
                    fullName: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    groupId: m.groupId
                }))
            },
            {
                name: 'Elders',
                count: members.filter(m => m.role === 'elder').length,
                members: members.filter(m => m.role === 'elder').map((m: any) => ({
                    _id: m._id,
                    fullName: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    groupId: m.groupId
                }))
            },
            {
                name: 'Ministerial Servants',
                count: members.filter(m => m.role === 'ministerial_servant').length,
                members: members.filter(m => m.role === 'ministerial_servant').map((m: any) => ({
                    _id: m._id,
                    fullName: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    groupId: m.groupId
                }))
            },
            {
                name: 'Pioneers',
                count: members.filter(m => m.role === 'pioneer').length,
                members: members.filter(m => m.role === 'pioneer').map((m: any) => ({
                    _id: m._id,
                    fullName: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    groupId: m.groupId
                }))
            }
        ];

        return JSON.parse(JSON.stringify({
            totalMembers: members.length,
            roles: roleCounts,
            privileges: privilegeCounts
        }));
    } catch (error) {
        console.log("Error fetching member analytics:", error);
        throw error;
    }
}

async function _getDashboardAnalytics(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const currentDate = new Date();
        const lastMonth = subMonths(currentDate, 1);
        const thisMonthStart = startOfMonth(currentDate);
        const thisMonthEnd = endOfMonth(currentDate);

        const [
            members,
            attendanceRecords,
            fieldServiceReports,
            transportFees,
            memberFeePayments,
            groups,
            privileges,
            activities
        ] = await Promise.all([
            Member.find({}).populate('privileges', 'name').populate('groupId', 'name').lean(),
            Attendance.find({}).lean(),
            FieldServiceReport.find({}).populate('publisher', 'fullName').lean(),
            TransportFee.find({ isActive: true }).lean(),
            MemberFeePayment.find({}).lean(),
            Group.find({}).lean(),
            Privilege.find({}).lean(),
            Activity.find({}).populate('userId', 'fullName').sort({ createdAt: -1 }).limit(50).lean()
        ]);

        // Member analytics
        const totalMembers = members.length;
        const activeMembers = members.filter(m => m.status === 'active').length;
        const newMembersThisMonth = members.filter(m => 
            new Date(m.createdAt) >= thisMonthStart && new Date(m.createdAt) <= thisMonthEnd
        ).length;

        const roleDistribution = [
            { _id: 'publisher', count: members.filter(m => m.role === 'publisher').length },
            { _id: 'elder', count: members.filter(m => m.role === 'elder').length },
            { _id: 'ministerial_servant', count: members.filter(m => m.role === 'ministerial_servant').length },
            { _id: 'pioneer', count: members.filter(m => m.role === 'pioneer').length }
        ];

        // Group analytics
        const memberCounts = groups.map(group => ({
            _id: group._id,
            name: group.name,
            memberCount: members.filter(m => m.groupId?._id?.toString() === group._id.toString()).length
        }));

        // Attendance analytics
        const totalMeetings = attendanceRecords.length;
        const totalAttendance = attendanceRecords.reduce((sum, record) => sum + (record.attendanceCount || 0), 0);
        const averageAttendance = totalMeetings > 0 ? Math.round(totalAttendance / totalMeetings) : 0;
        const weeklyMeetings = attendanceRecords.filter(record => record.meetingType === 'midweek').length;
        const weekendMeetings = attendanceRecords.filter(record => record.meetingType === 'weekend').length;

        // Field Service analytics
        const totalReports = fieldServiceReports.length;
        const totalHours = fieldServiceReports.reduce((sum, report) => sum + (report.hours || 0), 0);
        const totalBibleStudies = fieldServiceReports.reduce((sum, report) => sum + (report.bibleStudents || 0), 0);
        const approvedReports = fieldServiceReports.filter(report => report.check).length;

        // Transport analytics
        const participatingMembers = memberFeePayments.filter(payment => payment.isJoined).length;
        const totalPaid = memberFeePayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
        const fullyPaidMembers = memberFeePayments.filter(payment => payment.isPaid && payment.isJoined).length;

        // Recent activity
        const newMembers = members
            .filter(m => new Date(m.createdAt) >= subMonths(currentDate, 1))
            .slice(0, 5)
            .map(m => ({ _id: m._id, fullName: m.fullName, createdAt: m.createdAt }));

        const newReports = fieldServiceReports
            .filter(r => new Date(r.createdAt) >= subMonths(currentDate, 1))
            .slice(0, 5)
            .map(r => ({ _id: r._id, publisher: { fullName: r.publisher?.fullName || 'Unknown' }, createdAt: r.createdAt }));

        // Top publishers
        const publisherStats = fieldServiceReports.reduce((acc: any, report) => {
            const publisherName = report.publisher?.fullName || 'Unknown';
            if (!acc[publisherName]) {
                acc[publisherName] = { publisherName, totalHours: 0, totalStudies: 0, reportCount: 0 };
            }
            acc[publisherName].totalHours += report.hours || 0;
            acc[publisherName].totalStudies += report.bibleStudents || 0;
            acc[publisherName].reportCount += 1;
            return acc;
        }, {});

        const topPublishers = Object.values(publisherStats)
            .sort((a: any, b: any) => b.totalHours - a.totalHours)
            .slice(0, 5);

        // Demographics
        const privilegeCounts = privileges.map(privilege => ({
            _id: privilege.name,
            count: members.filter(member => 
                member.privileges?.some((p: any) => p._id.toString() === privilege._id.toString())
            ).length
        }));

        // Activity analytics
        const todayActivities = activities.filter(activity => 
            new Date(activity.createdAt).toDateString() === new Date().toDateString()
        ).length;

        const activityStats = activities.reduce((acc: any, activity) => {
            if (!acc[activity.type]) {
                acc[activity.type] = { _id: activity.type, count: 0 };
            }
            acc[activity.type].count += 1;
            return acc;
        }, {});

        const recentActivities = activities.slice(0, 10).map(activity => ({
            _id: activity._id,
            userId: { fullName: activity.userId?.fullName || 'Unknown User' },
            type: activity.type,
            action: activity.action,
            createdAt: activity.createdAt,
            success: activity.success
        }));

        // System health metrics
        const completionRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;
        const transportParticipation = totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;

        return JSON.parse(JSON.stringify({
            members: {
                total: totalMembers,
                active: activeMembers,
                newThisMonth: newMembersThisMonth,
                roleDistribution
            },
            groups: {
                total: groups.length,
                memberCounts
            },
            attendance: {
                totalMeetings,
                averageAttendance,
                weeklyMeetings,
                weekendMeetings,
                totalAttendance
            },
            fieldService: {
                totalReports,
                totalHours,
                totalBibleStudies,
                approvedReports
            },
            transport: {
                participating: participatingMembers,
                totalPaid,
                fullyPaid: fullyPaidMembers
            },
            recentActivity: {
                newMembers,
                newReports
            },
            trends: {
                monthly: [],
                topPublishers
            },
            systemHealth: {
                totalUsers: totalMembers,
                activeUsers: activeMembers,
                inactiveUsers: totalMembers - activeMembers,
                completionRate,
                transportParticipation,
                memberGrowth: 0,
                reportGrowth: 0,
                attendanceGrowth: 0
            },
            demographics: {
                privileges: privilegeCounts,
                ageGroups: []
            },
            activities: {
                recent: recentActivities,
                stats: Object.values(activityStats),
                todayCount: todayActivities
            }
        }));
    } catch (error) {
        console.log("Error fetching dashboard analytics:", error);
        throw error;
    }
}

export const fetchMemberAnalytics = await withAuth(_fetchMemberAnalytics);
export const getDashboardAnalytics = await withAuth(_getDashboardAnalytics);