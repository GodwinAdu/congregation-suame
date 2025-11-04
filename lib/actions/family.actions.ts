"use server"

import { User, withAuth } from "../helpers/auth";
import Family from "../models/family.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createFamily(user: User, values: {
    familyName: string;
    headOfFamily: string;
    members: Array<{
        memberId: string;
        relationship: string;
        isHead: boolean;
    }>;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newFamily = new Family({
            ...values,
            createdBy: user._id
        });

        await newFamily.save();

        await logActivity({
            userId: user._id as string,
            type: 'family_create',
            action: `${user.fullName} created family: ${values.familyName}`,
            details: { entityId: newFamily._id, entityType: 'Family' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(newFamily));
    } catch (error) {
        console.log("Error creating family:", error);
        throw error;
    }
}

async function _fetchFamilies(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const families = await Family.find({})
            .populate('members.memberId', 'fullName')
            .populate('headOfFamily', 'fullName')
            .sort({ familyName: 1 });

        return JSON.parse(JSON.stringify(families));
    } catch (error) {
        console.log("Error fetching families:", error);
        throw error;
    }
}

async function _updateFamily(user: User, id: string, values: any) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedFamily = await Family.findByIdAndUpdate(
            id,
            values,
            { new: true }
        ).populate('members.memberId', 'fullName');

        if (!updatedFamily) throw new Error("Family not found");

        await logActivity({
            userId: user._id as string,
            type: 'family_update',
            action: `${user.fullName} updated family`,
            details: { entityId: id, entityType: 'Family' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(updatedFamily));
    } catch (error) {
        console.log("Error updating family:", error);
        throw error;
    }
}

async function _deleteFamily(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        await Family.findByIdAndDelete(id);

        await logActivity({
            userId: user._id as string,
            type: 'family_delete',
            action: `${user.fullName} deleted family`,
            details: { entityId: id, entityType: 'Family' },
        });

        revalidatePath('/dashboard/members');
        return { success: true };
    } catch (error) {
        console.log("Error deleting family:", error);
        throw error;
    }
}

async function _getMemberFamily(user: User, memberId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const family = await Family.findOne({
            'members.memberId': memberId
        }).populate('members.memberId', 'fullName');

        return JSON.parse(JSON.stringify(family));
    } catch (error) {
        console.log("Error fetching member family:", error);
        throw error;
    }
}

export const createFamily = await withAuth(_createFamily);
export const fetchFamilies = await withAuth(_fetchFamilies);
export const updateFamily = await withAuth(_updateFamily);
export const deleteFamily = await withAuth(_deleteFamily);
export const getMemberFamily = await withAuth(_getMemberFamily);