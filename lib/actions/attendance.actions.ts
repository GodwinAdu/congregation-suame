"use server"

import { User, withAuth } from "../helpers/auth";
import Attendance from "../models/attendance.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

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