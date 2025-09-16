"use server"

import Activity from "../models/activity.models";
import { connectToDB } from "../mongoose";

interface ActivityDetails {
    entityId?: string;
    entityType?: string;
    oldValue?: string;
    newValue?: string;
    metadata?: any;
}

interface LogActivityParams {
    userId: string;
    type: string;
    action: string;
    details?: ActivityDetails;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}

export async function logActivity({
    userId,
    type,
    action,
    details = {},
    ipAddress = "Unknown",
    userAgent = "Unknown",
    success = true,
    errorMessage
}: LogActivityParams) {
    try {
        await connectToDB();

        await Activity.create({
            userId,
            type,
            action,
            details,
            ipAddress,
            userAgent,
            success,
            errorMessage,
            location: "Unknown",
            device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

