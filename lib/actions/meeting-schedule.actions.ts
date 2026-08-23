"use server"

import { User, withAuth } from "../helpers/auth";
import MeetingSchedule from "../models/meeting-schedule.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _getMeetingSchedules(user: User) {
    try {
        if (!user) throw new Error("User not authorized");
        await connectToDB();

        const schedules = await MeetingSchedule.find({}).lean();

        // If no schedules exist, create defaults
        if (schedules.length === 0) {
            const defaults = [
                {
                    meetingType: 'Midweek',
                    day: 'thursday',
                    startTime: '18:00',
                    endTime: '20:00',
                    gracePeriodMinutes: 10,
                    isActive: true,
                    updatedBy: user._id,
                },
                {
                    meetingType: 'Weekend',
                    day: 'sunday',
                    startTime: '08:30',
                    endTime: '10:30',
                    gracePeriodMinutes: 10,
                    isActive: true,
                    updatedBy: user._id,
                }
            ];

            const created = await MeetingSchedule.insertMany(defaults);
            return JSON.parse(JSON.stringify(created));
        }

        return JSON.parse(JSON.stringify(schedules));
    } catch (error) {
        console.error("Error fetching meeting schedules:", error);
        throw error;
    }
}

async function _updateMeetingSchedule(user: User, meetingType: 'Midweek' | 'Weekend', data: {
    day: string;
    startTime: string;
    endTime: string;
    gracePeriodMinutes: number;
}) {
    try {
        if (!user) throw new Error("User not authorized");
        await connectToDB();

        const schedule = await MeetingSchedule.findOneAndUpdate(
            { meetingType },
            {
                ...data,
                updatedBy: user._id,
            },
            { new: true, upsert: true, runValidators: true }
        );

        await logActivity({
            userId: user._id as string,
            type: 'settings_update',
            action: `${user.fullName} updated ${meetingType} meeting schedule to ${data.day} ${data.startTime}-${data.endTime}`,
            details: { entityType: 'MeetingSchedule' },
        });

        revalidatePath('/dashboard/attendance');
        revalidatePath('/dashboard/settings');
        return JSON.parse(JSON.stringify(schedule));
    } catch (error) {
        console.error("Error updating meeting schedule:", error);
        throw error;
    }
}

export const getMeetingSchedules = await withAuth(_getMeetingSchedules);
export const updateMeetingSchedule = await withAuth(_updateMeetingSchedule);
