"use server"

import { User, withAuth } from "../helpers/auth";
import PublicWitnessing from "../models/public-witnessing.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createPublicWitnessing(user: User, values: {
    location: string;
    date: Date;
    startTime: string;
    endTime: string;
    participants: Array<{ memberId: string; memberName: string; role: string }>;
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newSchedule = new PublicWitnessing({
            ...values,
            createdBy: user._id
        });

        await newSchedule.save();

        await logActivity({
            userId: user._id as string,
            type: 'public_witnessing_create',
            action: `${user.fullName} scheduled public witnessing at ${values.location}`,
            details: { entityId: newSchedule._id, entityType: 'PublicWitnessing' },
        });

        revalidatePath('/dashboard/field-service/public-witnessing');
        return JSON.parse(JSON.stringify(newSchedule));
    } catch (error) {
        console.log("Error creating public witnessing schedule:", error);
        throw error;
    }
}

async function _fetchPublicWitnessing(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const schedules = await PublicWitnessing.find({})
            .sort({ date: 1, startTime: 1 });

        return JSON.parse(JSON.stringify(schedules));
    } catch (error) {
        console.log("Error fetching public witnessing schedules:", error);
        throw error;
    }
}

async function _updatePublicWitnessing(user: User, id: string, values: any) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedSchedule = await PublicWitnessing.findByIdAndUpdate(
            id,
            values,
            { new: true }
        );

        if (!updatedSchedule) throw new Error("Schedule not found");

        await logActivity({
            userId: user._id as string,
            type: 'public_witnessing_update',
            action: `${user.fullName} updated public witnessing schedule`,
            details: { entityId: id, entityType: 'PublicWitnessing' },
        });

        revalidatePath('/dashboard/field-service/public-witnessing');
        return JSON.parse(JSON.stringify(updatedSchedule));
    } catch (error) {
        console.log("Error updating public witnessing schedule:", error);
        throw error;
    }
}

async function _deletePublicWitnessing(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        await PublicWitnessing.findByIdAndDelete(id);

        await logActivity({
            userId: user._id as string,
            type: 'public_witnessing_delete',
            action: `${user.fullName} deleted public witnessing schedule`,
            details: { entityId: id, entityType: 'PublicWitnessing' },
        });

        revalidatePath('/dashboard/field-service/public-witnessing');
        return { success: true };
    } catch (error) {
        console.log("Error deleting public witnessing schedule:", error);
        throw error;
    }
}

export const createPublicWitnessing = await withAuth(_createPublicWitnessing);
export const fetchPublicWitnessing = await withAuth(_fetchPublicWitnessing);
export const updatePublicWitnessing = await withAuth(_updatePublicWitnessing);
export const deletePublicWitnessing = await withAuth(_deletePublicWitnessing);