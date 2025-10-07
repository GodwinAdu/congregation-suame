"use server"

import { User, withAuth } from "../helpers/auth";
import Assignment from "../models/assignment.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createAssignment(user: User, values: {
    week: string;
    meetingType: "Midweek" | "Weekend";
    assignmentType: "Watchtower Reader" | "Bible Student Reader" | "Life and Ministry" | "Public Talk Speaker";
    title: string;
    description?: string;
    assignedTo?: string;
    assistant?: string;
    duration?: number;
    source?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newAssignment = new Assignment(values);
        await newAssignment.save();

        await logActivity({
            userId: user._id,
            type: 'assignment_create',
            action: `${user.fullName} created assignment: ${values.title}`,
            details: { entityId: newAssignment._id, entityType: 'Assignment' },
        });

        revalidatePath('/dashboard/assignments');
        return JSON.parse(JSON.stringify(newAssignment));

    } catch (error) {
        console.log("Error creating assignment:", error);
        throw error;
    }
}

async function _fetchAssignmentsByWeek(user: User, week: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const assignments = await Assignment.find({ week })
            .populate('assignedTo', 'fullName')
            .populate('assistant', 'fullName')
            .sort({ assignmentType: 1 });

        return JSON.parse(JSON.stringify(assignments));
    } catch (error) {
        console.log("Error fetching assignments:", error);
        throw error;
    }
}

async function _updateAssignment(user: User, id: string, values: {
    assignedTo?: string;
    assistant?: string;
    title?: string;
    description?: string;
    duration?: number;
    source?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            values,
            { new: true, runValidators: false }
        );

        if (!updatedAssignment) throw new Error("Assignment not found");

        await logActivity({
            userId: user._id,
            type: 'assignment_update',
            action: `${user.fullName} updated assignment`,
            details: { entityId: id, entityType: 'Assignment' },
        });

        revalidatePath('/dashboard/assignments');
        return JSON.parse(JSON.stringify(updatedAssignment));
    } catch (error) {
        console.log("Error updating assignment:", error);
        throw error;
    }
}

async function _fetchMembers(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({})
            .select('fullName gender')
            .sort({ fullName: 1 });

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("Error fetching members:", error);
        throw error;
    }
}



export const createAssignment = await withAuth(_createAssignment);
export const fetchAssignmentsByWeek = await withAuth(_fetchAssignmentsByWeek);
export const updateAssignment = await withAuth(_updateAssignment);
export const fetchMembers = await withAuth(_fetchMembers);