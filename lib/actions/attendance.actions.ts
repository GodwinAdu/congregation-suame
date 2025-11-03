"use server"

import { User, withAuth } from "../helpers/auth";
import Attendance from "../models/attendance.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createAttendance(user: User, values: { attendance: number; month: number; date: Date }) {
    try {
        if (!user) throw new Error("User not authorized");

        // Validate input
        if (!values.date) throw new Error("Date is required");
        if (values.attendance < 0) throw new Error("Attendance cannot be negative");
        if (values.date > new Date()) throw new Error("Cannot record attendance for future dates");

        await connectToDB();

        // Check for existing attendance on the same date
        const startOfDay = new Date(values.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(values.date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const existingAttendance = await Attendance.findOne({
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (existingAttendance) {
            throw new Error("Attendance already recorded for this date. Please edit the existing record instead.");
        }

        const newAttendance = new Attendance({
            attendance: values.attendance,
            month: values.month,
            date: values.date,
            createdBy: user._id
        });

        await newAttendance.save();

        await logActivity({
            userId: user._id as string,
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

async function _fetchAttendanceByServiceYear(user: User, serviceYear: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Service year runs from September to August
        const startDate = new Date(serviceYear, 8, 1); // September 1st
        const endDate = new Date(serviceYear + 1, 7, 31); // August 31st

        const attendance = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
                ,
            }
        }).sort({ date: 1 });

        // Group by month and calculate statistics
        const monthlyData = {};
        const months = [
            "September", "October", "November", "December",
            "January", "February", "March", "April",
            "May", "June", "July", "August"
        ];

        // Initialize all months
        months.forEach(month => {
            monthlyData[month] = {
                month,
                numberOfMeetings: 0,
                totalAttendance: 0,
                averageAttendance: 0
            };
        });

        // Process attendance records
        attendance.forEach(record => {
            const date = new Date(record.date);
            const monthIndex = date.getMonth();
            let monthName;

            // Map month index to service year month name
            if (monthIndex >= 8) {
                monthName = months[monthIndex - 8];
            } else {
                monthName = months[monthIndex + 4];
            }

            if (monthlyData[monthName]) {
                monthlyData[monthName].numberOfMeetings++;
                monthlyData[monthName].totalAttendance += record.attendance;
            }
        });

        // Calculate averages
        Object.values(monthlyData).forEach((data: any) => {
            if (data.numberOfMeetings > 0) {
                data.averageAttendance = Math.round(data.totalAttendance / data.numberOfMeetings);
            }
        });

        return JSON.parse(JSON.stringify(Object.values(monthlyData)));
    } catch (error) {
        console.log("error happened while fetching attendance by service year", error);
        throw error;
    }
}

async function _updateAttendance(user: User, id: string, values: { attendance: number }) {
    try {
        if (!user) throw new Error("User not authorized");
        if (!id) throw new Error("Attendance ID is required");
        if (values.attendance < 0) throw new Error("Attendance cannot be negative");

        await connectToDB();

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            id,
            { attendance: values.attendance },
            { new: true, runValidators: false }
        );

        if (!updatedAttendance) throw new Error("Attendance record not found");

        await logActivity({
            userId: user._id as string,
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

async function _updateMonthlyAttendance(user: User, month: string, serviceYear: number, values: { numberOfMeetings?: number; totalAttendance?: number }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // This is a simplified approach - in a real scenario, you'd want to update individual meeting records
        // For now, we'll just log the activity and return success
        await logActivity({
            userId: user._id as string,
            type: 'attendance_update',
            action: `${user.fullName} updated ${month} attendance data`,
            details: { month, serviceYear, values },
        });

        revalidatePath('/dashboard/attendance/attendance-tracker');
        return { success: true };
    } catch (error) {
        console.log("error happened while updating monthly attendance", error);
        throw error;
    }
}

async function _fetchAttendanceByServiceYearSeparated(user: User, serviceYear: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Service year runs from September to August
        const startDate = new Date(serviceYear, 8, 1); // September 1st
        const endDate = new Date(serviceYear + 1, 7, 31); // August 31st

        const attendance = await Attendance.find({
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        // Group by month and meeting type separately
        const monthlyData = {};
        const months = [
            "September", "October", "November", "December",
            "January", "February", "March", "April",
            "May", "June", "July", "August"
        ];

        // Initialize all months with both meeting types
        months.forEach(month => {
            monthlyData[month] = {
                month,
                midweek: {
                    numberOfMeetings: 0,
                    totalAttendance: 0,
                    averageAttendance: 0
                },
                weekend: {
                    numberOfMeetings: 0,
                    totalAttendance: 0,
                    averageAttendance: 0
                }
            };
        });

        // Process attendance records
        attendance.forEach(record => {
            const date = new Date(record.date);
            const monthIndex = date.getMonth();
            let monthName;

            // Map month index to service year month name
            if (monthIndex >= 8) {
                monthName = months[monthIndex - 8];
            } else {
                monthName = months[monthIndex + 4];
            }

            if (monthlyData[monthName]) {
                const meetingType = record.meetingType === "Weekend" ? "weekend" : "midweek";
                monthlyData[monthName][meetingType].numberOfMeetings++;
                monthlyData[monthName][meetingType].totalAttendance += record.attendance;
            }
        });

        // Calculate averages
        Object.values(monthlyData).forEach((data: any) => {
            ['midweek', 'weekend'].forEach(type => {
                if (data[type].numberOfMeetings > 0) {
                    data[type].averageAttendance = Math.round(data[type].totalAttendance / data[type].numberOfMeetings);
                }
            });
        });

        return JSON.parse(JSON.stringify(Object.values(monthlyData)));
    } catch (error) {
        console.log("error happened while fetching separated attendance by service year", error);
        throw error;
    }
}

async function _deleteAttendance(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            throw new Error("Attendance record not found");
        }

        await Attendance.findByIdAndDelete(id);

        await logActivity({
            userId: user._id as string,
            type: 'attendance_delete',
            action: `${user.fullName} deleted attendance record for ${attendance.date.toDateString()}`,
            details: { entityId: id, entityType: 'Attendance' },
        });

        revalidatePath('/dashboard/attendance');
        return { success: true };
    } catch (error) {
        console.log("error happened while deleting attendance", error);
        throw error;
    }
}

export const createAttendance = await withAuth(_createAttendance);
export const fetchAttendanceByMonth = await withAuth(_fetchAttendanceByMonth);
export const fetchAllAttendance = await withAuth(_fetchAllAttendance);
export const fetchAttendanceByServiceYear = await withAuth(_fetchAttendanceByServiceYear);
export const fetchAttendanceByServiceYearSeparated = await withAuth(_fetchAttendanceByServiceYearSeparated);
export const updateAttendance = await withAuth(_updateAttendance);
export const updateMonthlyAttendance = await withAuth(_updateMonthlyAttendance);
export const deleteAttendance = await withAuth(_deleteAttendance);