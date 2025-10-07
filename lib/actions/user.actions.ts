"use server"

import { type User, withAuth } from "../helpers/auth";
import Group from "../models/group.models";
import Privilege from "../models/privilege.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

interface MemberProps {
    fullName: string;
    email: string;
    phone: string;
    gender?: string;
    dob?: Date;
    address?: string;
    emergencyContact?: string;
    password: string;
    role: string;
    groupId?: string;
    privileges: string[];
}

async function _createMember(user: User, values: MemberProps) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingMember = await Member.findOne({ phone: values.phone });
        if (existingMember) {
            throw new Error("Member with this email already exists");
        }

        const hashedPassword = await hash(values.password, 12);

        const newMember = new Member({
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            gender: values.gender,
            dob: values.dob,
            address: values.address,
            emergencyContact: values.emergencyContact,
            password: hashedPassword,
            role: values.role,
            groupId: values.groupId,
            privileges: values.privileges,
            createdBy: user._id
        });

        await newMember.save();

        await logActivity({
            userId: user._id as string,
            type: 'member_create',
            action: `${user.fullName} created a new member: ${newMember.fullName}`,
            details: { entityId: newMember._id, entityType: 'Member' },
        });

        return JSON.parse(JSON.stringify(newMember));

    } catch (error) {
        console.log("error happened while creating member", error);
        throw error;
    }
}

async function _fetchAllMembers(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({})
            .populate([
                { path: "privileges", model: Privilege },
                { path: "groupId", model: Group },
                { path: "createdBy", model: Member },
            ])
            .exec();

        if (!members || members.length === 0) return [];

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("error happened while fetching all members", error);
        throw error;
    }
}
async function _fetchAllMembersByRole(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const value = user.groupId

        console.log(value, "user group id")

        const members = await Member.find({ groupId: value })
            .populate([
                { path: "privileges", model: Privilege },
                { path: "groupId", model: Group },
                { path: "createdBy", model: Member },
            ])
            .exec();

        if (!members || members.length === 0) return [];

        console.log(members, "members")

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("error happened while fetching all members", error);
        throw error;
    }
}


async function _resetPassword(user: User, values: { currentPassword: string; newPassword: string }) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const userDoc = await Member.findById(user._id);
        if (!userDoc) {
            throw new Error("User not found");
        }

        const isCurrentPasswordValid = await compare(values.currentPassword, userDoc.password);
        if (!isCurrentPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        const hashedNewPassword = await hash(values.newPassword, 12);
        userDoc.password = hashedNewPassword;
        await userDoc.save();

        await logActivity({
            userId: user._id as string,
            type: 'password_change',
            action: `${user.fullName} changed their password`,
            details: { entityId: user._id as string, entityType: 'User' },
        });

    } catch (error) {
        console.log("error happened while resetting password", error);
        throw error;
    }
}

export async function fetchUserById(id: string) {
    try {
        await connectToDB();

        const user = await Member.findById(id);

        if (!user) {
            throw new Error("User not found");
        }

        return JSON.parse(JSON.stringify(user));
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user");
    }
}


// async function _resetUserPassword(user: UserProps, id: string) {
//     try {
//         if (!user) throw new Error("User not authenticated")
//         await connectToDB()

//         const staff = await User.findById(id)
//         if (!staff) throw new Error("Staff not found")

//         const resetCode = generateCode(8)
//         const newCode = new Code({
//             code: resetCode,
//             email: staff.email,
//             type: "password_reset",
//         })

//         await Promise.all([
//             newCode.save(),
//             wrappedSendMail({
//                 to: staff.email,
//                 subject: "Password Reset Request",
//                 html: `
//                     <h2>Password Reset</h2>
//                     <p>Hello ${staff.fullName},</p>
//                     <p>A password reset has been requested for your account.</p>
//                     <p><strong>Reset Code:</strong> ${resetCode}</p>
//                     <p>Use this code to reset your password. This code will expire in 24 hours.</p>
//                     <p>If you didn't request this reset, please ignore this email.</p>
//                 `,
//             })
//         ])

//         // Log activity
//         await createActivity({
//             userId: id,
//             type: 'password_change',
//             action: 'Password reset requested'
//         })

//         return { success: true, message: "Password reset email sent successfully" }
//     } catch (error) {
//         console.error("Error resetting password:", error)
//         throw error
//     }
// }

// export const resetUserPassword = await withAuth(_resetUserPassword)

// async function _sendInviteEmail(user: UserProps, id: string) {
//     try {
//         if (!user) throw new Error("User not authenticated")
//         await connectToDB()

//         const staff = await User.findById(id)
//         if (!staff) throw new Error("Staff not found")



//         await Promise.all([
//             newCode.save(),
//             wrappedSendMail({
//                 to: staff.email,
//                 subject: "Welcome to GML Roofing Systems",
//                 html: `
//                     <h2>Welcome to GML Roofing Systems!</h2>
//                     <p>Hello ${staff.fullName},</p>
//                     <p>You have been invited to join our team at GML Roofing Systems.</p>
//                     <p><strong>Verification Code:</strong> ${inviteCode}</p>
//                     <p>Please use this code to complete your account setup.</p>
//                     <p>Welcome aboard!</p>
//                 `,
//             })
//         ])

//         // Log activity
//         await createActivity({
//             userId: id,
//             type: 'email_verification',
//             action: 'Invitation email sent'
//         })

//         return { success: true, message: "Invitation sent successfully" }
//     } catch (error) {
//         console.error("Error sending invite:", error)
//         throw error
//     }
// }

// export const sendInviteEmail = await withAuth(_sendInviteEmail)

async function _updateMember(user: User, id: string, updateData: Partial<MemberProps>) {
    try {
        if (!user) throw new Error("User not authenticated")
        await connectToDB()

        const updatedStaff = await Member.findByIdAndUpdate(
            id,
            {
                ...updateData,
                lastModified: new Date(),
                modifiedBy: user._id
            },
            { new: true }
        )

        if (!updatedStaff) throw new Error("Staff not found")

        await logActivity({
            userId: user._id as string,
            type: 'profile_update',
            action: `${user.fullName} updated member ${updatedStaff.fullName}`,
            details: { entityId: id, entityType: 'Member' },
        });

        revalidatePath('/dashboard/hr/staffs')
        return { success: true, message: "Staff updated successfully" }
    } catch (error) {
        console.error("Error updating user:", error)
        throw error
    }
}

async function _updateProfile(user: User, updateData: {
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dob?: Date;
    address?: string;
    emergencyContact?: string;
}) {
    try {
        if (!user) throw new Error("User not authenticated");

        await connectToDB();

        const updatedUser = await Member.findByIdAndUpdate(
            user._id,
            {
                ...updateData,
                lastModified: new Date(),
                modifiedBy: user._id
            },
            { new: true, runValidators: false }
        );

        if (!updatedUser) throw new Error("User not found");

        await logActivity({
            userId: user._id as string,
            type: 'profile_update',
            action: `${user.fullName} updated their profile`,
            details: { entityId: user._id as string, entityType: 'User' },
        });

        return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}

export const updateMember = await withAuth(_updateMember);
export const updateProfile = await withAuth(_updateProfile);


async function _updateMemberRole(user: User, memberId: string, roleId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findByIdAndUpdate(
            memberId,
            { role: roleId },
            { new: true, runValidators: false }
        );

        if (!member) {
            throw new Error("Member not found");
        }

        await logActivity({
            userId: user._id as string,
            type: 'role_update',
            action: `${user.fullName} updated ${member.fullName}'s role`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.log("error happened while updating member role", error);
        throw error;
    }
}

async function _updateMemberGroup(user: User, memberId: string, groupId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findByIdAndUpdate(
            memberId,
            { groupId: groupId },
            { new: true, runValidators: false }
        );

        if (!member) {
            throw new Error("Member not found");
        }

        await logActivity({
            userId: user._id as string,
            type: 'group_update',
            action: `${user.fullName} updated ${member.fullName}'s group`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.log("error happened while updating member group", error);
        throw error;
    }
}

async function _updateMemberPrivileges(user: User, memberId: string, privileges: string[]) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findByIdAndUpdate(
            memberId,
            { privileges: privileges },
            { new: true, runValidators: false }
        );

        if (!member) {
            throw new Error("Member not found");
        }

        await logActivity({
            userId: user._id as string,
            type: 'privileges_update',
            action: `${user.fullName} updated ${member.fullName}'s privileges`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/members');
        return JSON.parse(JSON.stringify(member));
    } catch (error) {
        console.log("error happened while updating member privileges", error);
        throw error;
    }
}

export const createMember = await withAuth(_createMember);
export const fetchAllMembers = await withAuth(_fetchAllMembers);
export const fetchAllMembersByRole = await withAuth(_fetchAllMembersByRole);
export const resetPassword = await withAuth(_resetPassword);
export const updateMemberRole = await withAuth(_updateMemberRole);
export const updateMemberGroup = await withAuth(_updateMemberGroup);
export const updateMemberPrivileges = await withAuth(_updateMemberPrivileges);
