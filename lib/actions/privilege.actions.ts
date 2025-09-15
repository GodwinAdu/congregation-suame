"use server"

import { User, withAuth } from "../helpers/auth";
import Privilege from "../models/privilege.models";
import { connectToDB } from "../mongoose";


async function _createPrivilege(user: User, values: { name: string }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingPrivilege = await Privilege.findOne({ name: values.name });

        if (existingPrivilege) throw new Error("Privilege already exists");

        const newPrivilege = new Privilege({
            name: values.name,
            createdBy: user._id,
        });

        await newPrivilege.save();

    } catch (error) {
        console.log("error happened while creating Privilege", error);
        throw error
    }
}

async function _fetchAllPrivileges(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const privileges = await Privilege.find({})
            .populate("createdBy")
            .exec();

        if (!privileges || privileges.length === 0) return []

        const data = privileges.map((doc) => ({
            ...doc.toObject(),
            createdBy: doc.createdBy.fullName
        }))

    return JSON.parse(JSON.stringify(data));
} catch (error) {
    console.log("error happened while fetching privileges", error);
    throw error
}
}



async function _fetchPrivilegeById(user: User, id: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const privilege = await Privilege.findById(id);

        if (!privilege) throw new Error("privilege not found");

        return JSON.parse(JSON.stringify(privilege));
    } catch (error) {
        console.log("error happened while fetching privilege", error);
        throw error
    }
}



async function _updatePrivilege(user: User, id: string, values: { name: string }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const privilege = await Privilege.findById(id);

        if (!privilege) throw new Error("privilege not found");

        privilege.name = values.name;

        await privilege.save();

    } catch (error) {
        console.log("error happened while updating privilege", error);
        throw error
    }
}




export const createPrivilege = await withAuth(_createPrivilege);
export const fetchAllPrivileges = await withAuth(_fetchAllPrivileges);
export const fetchPrivilegeById = await withAuth(_fetchPrivilegeById);
export const updatePrivilege = await withAuth(_updatePrivilege);
