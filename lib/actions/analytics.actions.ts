"use server"

import { User, withAuth } from "../helpers/auth";
import Member from "../models/user.models";
import Role from "../models/role.models";
import Group from "../models/group.models";
import Attendance from "../models/attendance.models";
import FieldService from "../models/field-service.models";
import { connectToDB } from "../mongoose";

async function _getDashboardAnalytics(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Get current date info
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // Member statistics
        const totalMembers = await Member.countDocuments({});
        const activeMembers = await Member.countDocuments({ isActive: true });
        const newMembersThisMonth = await Member.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Role distribution
        const roleDistribution = await Member.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Group statistics
        const totalGroups = await Group.countDocuments({});
        const groupMemberCounts = await Group.aggregate([
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "groupId",
                    as: "members"
                }
            },
            {
                $project: {
                    name: 1,
                    memberCount: { $size: "$members" }
                }
            },
            { $sort: { memberCount: -1 } }
        ]);

        // Attendance statistics
        const thisMonthAttendance = await Attendance.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const attendanceStats = {
            totalMeetings: thisMonthAttendance.length,
            averageAttendance: thisMonthAttendance.length > 0 
                ? Math.round(thisMonthAttendance.reduce((sum, att) => sum + (att.attendance || 0), 0) / thisMonthAttendance.length)
                : 0,
            weeklyMeetings: thisMonthAttendance.filter(att => att.meetingType === 'Midweek').length,
            weekendMeetings: thisMonthAttendance.filter(att => att.meetingType === 'Weekend').length,
            totalAttendance: thisMonthAttendance.reduce((sum, att) => sum + (att.attendance || 0), 0)
        };

        // Field service statistics
        const thisMonthReports = await FieldService.find({
            month: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const fieldServiceStats = {
            totalReports: thisMonthReports.length,
            totalHours: thisMonthReports.reduce((sum, report) => sum + (report.hours || 0), 0),
            totalBibleStudies: thisMonthReports.reduce((sum, report) => sum + (report.bibleStudents || 0), 0),
            approvedReports: thisMonthReports.filter(report => report.check).length
        };

        // Transport statistics
        const transportStats = await Member.aggregate([
            {
                $group: {
                    _id: null,
                    participating: { $sum: { $cond: ["$transport.carStatus", 1, 0] } },
                    totalPaid: { $sum: "$transport.amount" },
                    fullyPaid: { $sum: { $cond: ["$transport.payed", 1, 0] } }
                }
            }
        ]);

        const transport = transportStats[0] || { participating: 0, totalPaid: 0, fullyPaid: 0 };

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentMembers = await Member.find({
            createdAt: { $gte: sevenDaysAgo }
        }).select('fullName createdAt').sort({ createdAt: -1 }).limit(5);

        const recentReports = await FieldService.find({
            createdAt: { $gte: sevenDaysAgo }
        }).populate('publisher', 'fullName').sort({ createdAt: -1 }).limit(5);

        // Monthly trends (last 6 months)
        const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
        const monthlyTrends = await Member.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Top performers (field service)
        const topPublishers = await FieldService.aggregate([
            {
                $match: {
                    month: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: "$publisher",
                    totalHours: { $sum: "$hours" },
                    totalStudies: { $sum: "$bibleStudents" },
                    reportCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "publisherInfo"
                }
            },
            {
                $project: {
                    publisherName: { $arrayElemAt: ["$publisherInfo.fullName", 0] },
                    totalHours: 1,
                    totalStudies: 1,
                    reportCount: 1
                }
            },
            { $sort: { totalHours: -1 } },
            { $limit: 5 }
        ]);

        // Additional analytics
        const lastMonth = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0);
        
        const lastMonthMembers = await Member.countDocuments({
            createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        
        const lastMonthReports = await FieldService.countDocuments({
            month: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        
        const lastMonthAttendance = await Attendance.find({
            date: { $gte: lastMonth, $lte: lastMonthEnd }
        });
        
        const lastMonthAvgAttendance = lastMonthAttendance.length > 0 
            ? Math.round(lastMonthAttendance.reduce((sum, att) => sum + (att.attendance || 0), 0) / lastMonthAttendance.length)
            : 0;

        // Growth calculations
        const memberGrowth = lastMonthMembers > 0 
            ? Math.round(((newMembersThisMonth - lastMonthMembers) / lastMonthMembers) * 100)
            : newMembersThisMonth > 0 ? 100 : 0;
            
        const reportGrowth = lastMonthReports > 0 
            ? Math.round(((fieldServiceStats.totalReports - lastMonthReports) / lastMonthReports) * 100)
            : fieldServiceStats.totalReports > 0 ? 100 : 0;
            
        const attendanceGrowth = lastMonthAvgAttendance > 0 
            ? Math.round(((attendanceStats.averageAttendance - lastMonthAvgAttendance) / lastMonthAvgAttendance) * 100)
            : attendanceStats.averageAttendance > 0 ? 100 : 0;

        // System health metrics
        const systemHealth = {
            totalUsers: totalMembers,
            activeUsers: activeMembers,
            inactiveUsers: totalMembers - activeMembers,
            completionRate: fieldServiceStats.totalReports > 0 
                ? Math.round((fieldServiceStats.approvedReports / fieldServiceStats.totalReports) * 100)
                : 0,
            transportParticipation: transport.participating > 0 
                ? Math.round((transport.fullyPaid / transport.participating) * 100)
                : 0,
            memberGrowth,
            reportGrowth,
            attendanceGrowth
        };

        // Privilege distribution
        const privilegeStats = await Member.aggregate([
            { $unwind: { path: "$privileges", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "privileges",
                    localField: "privileges",
                    foreignField: "_id",
                    as: "privilegeInfo"
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$privileges", null] },
                            then: "No Privilege",
                            else: { $arrayElemAt: ["$privilegeInfo.name", 0] }
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Age demographics (if birthDate exists)
        const ageStats = await Member.aggregate([
            {
                $match: {
                    birthDate: { $exists: true, $ne: null }
                }
            },
            {
                $project: {
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), "$birthDate"] },
                                365.25 * 24 * 60 * 60 * 1000
                            ]
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: "$age",
                    boundaries: [0, 18, 30, 45, 60, 100],
                    default: "Unknown",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        return JSON.parse(JSON.stringify({
            members: {
                total: totalMembers,
                active: activeMembers,
                newThisMonth: newMembersThisMonth,
                roleDistribution
            },
            groups: {
                total: totalGroups,
                memberCounts: groupMemberCounts
            },
            attendance: attendanceStats,
            fieldService: fieldServiceStats,
            transport,
            recentActivity: {
                newMembers: recentMembers,
                newReports: recentReports
            },
            trends: {
                monthly: monthlyTrends,
                topPublishers
            },
            systemHealth,
            demographics: {
                privileges: privilegeStats,
                ageGroups: ageStats
            }
        }));
    } catch (error) {
        console.log("Error fetching dashboard analytics:", error);
        throw error;
    }
}

export const getDashboardAnalytics = await withAuth(_getDashboardAnalytics);