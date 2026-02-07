"use server"

import { User, withAuth } from "../helpers/auth";
import Group from "../models/group.models";
import { connectToDB } from "../mongoose";
import { logActivity } from "../utils/activity-logger";


async function _createGroup(user: User, values: { name: string }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingGroup = await Group.findOne({ name: values.name });

        if (existingGroup) throw new Error("Group already exists");

        const newGroup = new Group({
            name: values.name,
            createdBy: user._id,
        });

        await logActivity({
            userId: user._id as string,
            type: 'group_created',
            action: `${user.fullName} created group: ${values.name}`,
            details: { entityId: newGroup._id, entityType: 'Group' },
        });


        await newGroup.save();

    } catch (error) {
        console.log("error happened while creating group", error);
        throw error
    }
}

async function _fetchAllGroups(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const groups = await Group.find({})
            .populate("createdBy")
            .exec();

        if (!groups || groups.length === 0) return []

        const data = groups.map((doc) => ({
            ...doc.toObject(),
            createdBy: doc.createdBy.fullName
        }))

        return JSON.parse(JSON.stringify(data));
    } catch (error) {
        console.log("error happened while fetching groups", error);
        throw error
    }
}


async function _getUserGroup(user: User) {
    try {
        if (!user) {
            throw new Error("User not authenticated");
        }
        const value = user.groupId

        await connectToDB();

        const group = await Group.findById(value);

        if (!group) {
            throw new Error("group not found");
        }

        return JSON.parse(JSON.stringify(group));

    } catch (error) {
        console.log('Error fetching group', error);
        throw error;
    }

}


async function _fetchGroupById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const group = await Group.findById(id);

        if (!group) throw new Error("Group not found");

        return JSON.parse(JSON.stringify(group));
    } catch (error) {
        console.log("error happened while fetching group", error);
        throw error
    }
}



async function _updateGroup(user: User, id: string, values: { name: string }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const group = await Group.findById(id);

        if (!group) throw new Error("Group not found");

        group.name = values.name;
        group.modifiedBy = user._id;

        await group.save();

    } catch (error) {
        console.log("error happened while updating group", error);
        throw error
    }
}

async function _deleteGroup(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const group = await Group.findById(id);
        if (!group) throw new Error("Group not found");

        await Group.findByIdAndDelete(id);

    } catch (error) {
        console.log("error happened while deleting group", error);
        throw error
    }
}




export const createGroup = await withAuth(_createGroup);
export const fetchAllGroups = await withAuth(_fetchAllGroups);
export const getUserGroup = await withAuth(_getUserGroup);
export const fetchGroupById = await withAuth(_fetchGroupById);
export const updateGroup = await withAuth(_updateGroup);
export const deleteGroup = await withAuth(_deleteGroup);
