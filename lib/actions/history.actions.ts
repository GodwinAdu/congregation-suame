"use server"

import Activity from "../models/activity.models";
import { connectToDB } from "../mongoose";
import { type User, withAuth } from '../helpers/auth';
import { logActivity } from "../utils/activity-logger";

async function _fetchAllHistories(user: User, lastId: string | null, limit: number) {
    try {
        if (!user) throw new Error('User not logged in');

        await connectToDB();

        const query: { _id?: { $lt: string } } = {};

        if (lastId) {
            query._id = { $lt: lastId };
        }

        const activities = await Activity.find(query)
            .populate("userId", "fullName")
            .sort({ _id: -1 })
            .limit(limit)
            .exec();

        // Transform activity data to match history interface
        const histories = activities.map(activity => ({
            _id: activity._id,
            actionType: activity.type.toUpperCase(),
            details: activity.details || {},
            performedBy: {
                fullName: activity.userId?.fullName || 'Unknown User'
            },
            entityId: activity.details?.entityId || activity._id,
            message: activity.action,
            entityType: activity.details?.entityType || 'Unknown',
            timestamp: activity.createdAt,
            createdAt: activity.createdAt,
            updatedAt: activity.updatedAt
        }));

        return JSON.parse(JSON.stringify(histories));
    } catch (error) {
        console.error("Error fetching histories:", error);
        throw error;
    }
}

async function _deleteHistory(user: User, id: string) {
    try {
        if (!user) throw new Error('User not logged in');

        await connectToDB();

        const deletedActivity = await Activity.findByIdAndDelete(id);

        if (!deletedActivity) {
            throw new Error(`Activity with ID ${id} does not exist`);
        }

        await logActivity({
            userId: user._id as string,
            type: 'history_delete',
            action: `${user.fullName} deleted activity record`,
            details: { entityId: id, entityType: 'Activity' },
        });

        return { success: true, message: "Activity record deleted successfully" };

    } catch (error) {
        console.error("Error deleting history:", error);
        throw error;
    }
}

async function _bulkDeleteHistory(user: User, ids: string[]) {
    try {
        if (!user) throw new Error('User not logged in');

        await connectToDB();

        const result = await Activity.deleteMany({ _id: { $in: ids } });

        await logActivity({
            userId: user._id as string,
            type: 'history_bulk_delete',
            action: `${user.fullName} deleted ${result.deletedCount} activity records`,
            details: { entityType: 'Activity', metadata: { deletedCount: result.deletedCount } },
        });

        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        console.error("Error bulk deleting history:", error);
        throw error;
    }
}

async function _clearAllHistory(user: User) {
    try {
        if (!user) throw new Error('User not logged in');

        await connectToDB();

        const count = await Activity.countDocuments({});
        await Activity.deleteMany({});

        await logActivity({
            userId: user._id as string,
            type: 'history_clear_all',
            action: `${user.fullName} cleared all activity history (${count} records)`,
            details: { entityType: 'Activity', metadata: { clearedCount: count } },
        });

        return { success: true, clearedCount: count };
    } catch (error) {
        console.error("Error clearing all history:", error);
        throw error;
    }
}

export const fetchAllHistories = await withAuth(_fetchAllHistories);
export const deleteHistory = await withAuth(_deleteHistory);
export const bulkDeleteHistory = await withAuth(_bulkDeleteHistory);
export const clearAllHistory = await withAuth(_clearAllHistory);