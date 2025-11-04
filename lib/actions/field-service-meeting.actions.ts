"use server"

import { User, withAuth } from "../helpers/auth";
import FieldServiceMeeting from "../models/field-service-meeting.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createFieldServiceMeeting(user: User, values: any) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newMeeting = new FieldServiceMeeting({
            ...values,
            createdBy: user._id
        });

        await newMeeting.save();

        await logActivity({
            userId: user._id as string,
            type: 'field_service_meeting_create',
            action: `${user.fullName} scheduled field service meeting`,
            details: { entityId: newMeeting._id, entityType: 'FieldServiceMeeting' },
        });

        revalidatePath('/dashboard/field-service/meeting-schedule');
        return JSON.parse(JSON.stringify(newMeeting));
    } catch (error) {
        console.log("Error creating field service meeting:", error);
        throw error;
    }
}

async function _fetchFieldServiceMeetings(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const meetings = await FieldServiceMeeting.find({})
            .sort({ date: 1 });

        return JSON.parse(JSON.stringify(meetings));
    } catch (error) {
        console.log("Error fetching field service meetings:", error);
        throw error;
    }
}

async function _updateFieldServiceMeeting(user: User, id: string, values: any) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedMeeting = await FieldServiceMeeting.findByIdAndUpdate(
            id,
            values,
            { new: true }
        );

        if (!updatedMeeting) throw new Error("Meeting not found");

        await logActivity({
            userId: user._id as string,
            type: 'field_service_meeting_update',
            action: `${user.fullName} updated field service meeting`,
            details: { entityId: id, entityType: 'FieldServiceMeeting' },
        });

        revalidatePath('/dashboard/field-service/meeting-schedule');
        return JSON.parse(JSON.stringify(updatedMeeting));
    } catch (error) {
        console.log("Error updating field service meeting:", error);
        throw error;
    }
}

async function _deleteFieldServiceMeeting(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        await FieldServiceMeeting.findByIdAndDelete(id);

        await logActivity({
            userId: user._id as string,
            type: 'field_service_meeting_delete',
            action: `${user.fullName} deleted field service meeting`,
            details: { entityId: id, entityType: 'FieldServiceMeeting' },
        });

        revalidatePath('/dashboard/field-service/meeting-schedule');
        return { success: true };
    } catch (error) {
        console.log("Error deleting field service meeting:", error);
        throw error;
    }
}

export const createFieldServiceMeeting = await withAuth(_createFieldServiceMeeting);
export const fetchFieldServiceMeetings = await withAuth(_fetchFieldServiceMeetings);
export const updateFieldServiceMeeting = await withAuth(_updateFieldServiceMeeting);
export const deleteFieldServiceMeeting = await withAuth(_deleteFieldServiceMeeting);