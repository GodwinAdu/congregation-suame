"use server"

import { User, withAuth } from "../helpers/auth";
import Activity from "../models/activity.models";
import { connectToDB } from "../mongoose";
import { logActivity } from "../utils/activity-logger";

async function _getRecentActivities(user: User, limit: number = 50) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const activities = await Activity.find({})
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit);

        return JSON.parse(JSON.stringify(activities));
    } catch (error) {
        console.log("Error fetching activities:", error);
        throw error;
    }
}

async function _getUserActivities(user: User, userId: string, limit: number = 20) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const activities = await Activity.find({ userId })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(limit);

        return JSON.parse(JSON.stringify(activities));
    } catch (error) {
        console.log("Error fetching user activities:", error);
        throw error;
    }
}

async function _getActivityStats(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [todayCount, weekCount, totalCount, typeStats] = await Promise.all([
            Activity.countDocuments({ createdAt: { $gte: startOfDay } }),
            Activity.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Activity.countDocuments({}),
            Activity.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        return JSON.parse(JSON.stringify({
            todayCount,
            weekCount,
            totalCount,
            typeStats
        }));
    } catch (error) {
        console.log("Error fetching activity stats:", error);
        throw error;
    }
}



export const getRecentActivities = await withAuth(_getRecentActivities);
export const getUserActivities = await withAuth(_getUserActivities);
export const getActivityStats = await withAuth(_getActivityStats);