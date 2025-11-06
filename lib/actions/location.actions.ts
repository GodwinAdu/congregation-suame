"use server"

import { User, withAuth } from "../helpers/auth";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
    isPublic: boolean;
}

async function _updateMemberLocation(user: User, memberId: string, locationData: LocationData) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findByIdAndUpdate(
            memberId,
            {
                location: {
                    ...locationData,
                    lastUpdated: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        if (!member) throw new Error("Member not found");

        await logActivity({
            userId: user._id,
            type: 'location_update',
            action: `${user.fullName} updated location for ${member.fullName}`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.log("Error updating location:", error);
        throw error;
    }
}

async function _getMembersWithLocations(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({
            'location.latitude': { $ne: null },
            'location.longitude': { $ne: null },
            'location.isPublic': true
        }).select('fullName location groupId');

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("Error fetching member locations:", error);
        throw error;
    }
}

async function _updateMyLocation(user: User, locationData: LocationData) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findByIdAndUpdate(
            user._id,
            {
                location: {
                    ...locationData,
                    lastUpdated: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        if (!member) throw new Error("Member not found");

        await logActivity({
            userId: user._id,
            type: 'location_update',
            action: `${user.fullName} updated their location`,
            details: { entityId: user._id, entityType: 'Member' },
        });

        revalidatePath('/dashboard/profile');
        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.log("Error updating my location:", error);
        throw error;
    }
}

export const updateMemberLocation = await withAuth(_updateMemberLocation);
export const getMembersWithLocations = await withAuth(_getMembersWithLocations);
export const updateMyLocation = await withAuth(_updateMyLocation);