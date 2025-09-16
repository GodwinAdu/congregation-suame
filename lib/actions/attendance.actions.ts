"use server"

import { User, withAuth } from "../helpers/auth";
import Attendance from "../models/attendance.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createAttendance(user: User, values: { attendance: number; month: number; date: Date }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newAttendance = new Attendance({
            attendance: values.attendance,
            month: values.month,
            date: values.date,
            createdBy: user._id
        });

        await newAttendance.save();
        
        await logActivity({
            userId: user._id,
            type: 'attendance_record',
            action: `${user.fullName} recorded attendance for ${values.date.toDateString()}: ${values.attendance} attendees`,
            details: { entityId: newAttendance._id, entityType: 'Attendance' },
        });
        
        revalidatePath('/dashboard/attendance');
        return JSON.parse(JSON.stringify(newAttendance));

    } catch (error) {
        console.log("error happened while creating attendance", error);
        throw error;
    }
}

async function _fetchAttendanceByMonth(user: User, month: number, year: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendance = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        return JSON.parse(JSON.stringify(attendance));
    } catch (error) {
        console.log("error happened while fetching attendance", error);
        throw error;
    }
}

async function _fetchAllAttendance(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const attendance = await Attendance.find({})
            .sort({ date: -1 })
            .limit(100);

        return JSON.parse(JSON.stringify(attendance));
    } catch (error) {
        console.log("error happened while fetching all attendance", error);
        throw error;
    }
}

async function _updateAttendance(user: User, id: string, values: { attendance: number }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            id,
            { attendance: values.attendance },
            { new: true, runValidators: false }
        );

        if (!updatedAttendance) throw new Error("Attendance record not found");
        
        await logActivity({
            userId: user._id,
            type: 'attendance_update',
            action: `${user.fullName} updated attendance record to ${values.attendance} attendees`,
            details: { entityId: id, entityType: 'Attendance' },
        });

        revalidatePath('/dashboard/attendance');
        return JSON.parse(JSON.stringify(updatedAttendance));
    } catch (error) {
        console.log("error happened while updating attendance", error);
        throw error;
    }
}

export const createAttendance = await withAuth(_createAttendance);
export const fetchAttendanceByMonth = await withAuth(_fetchAttendanceByMonth);
export const fetchAllAttendance = await withAuth(_fetchAllAttendance);
export const updateAttendance = await withAuth(_updateAttendance);