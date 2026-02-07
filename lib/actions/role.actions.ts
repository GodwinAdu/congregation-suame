"use server"

import { User, withAuth } from "../helpers/auth";
import Role from "../models/role.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

interface RoleData {
    name: string;
    permissions: {
        // Core Dashboard
        dashboard: boolean;
        publisherDashboard: boolean;
        profile: boolean;
        settings: boolean;
        resetPassword: boolean;
        
        // Configuration
        config: boolean;
        configDuties: boolean;
        configGroup: boolean;
        configPrivilege: boolean;
        configRole: boolean;
        updatePermissions: boolean;
        
        // Member Management
        manageAllMembers: boolean;
        manageGroupMembers: boolean;
        memberAnalytics: boolean;
        memberFamilies: boolean;
        
        // Reports
        manageAllReport: boolean;
        manageGroupReport: boolean;
        monthlyReport: boolean;
        monthlyReportHelpNeeded: boolean;
        overseerReports: boolean;
        overseerAnalytics: boolean;
        
        // Attendance
        manageAttendance: boolean;
        attendanceTracker: boolean;
        
        // Assignments & Meetings
        assignments: boolean;
        calendar: boolean;
        
        // Field Service
        fieldService: boolean;
        fieldServiceMeetingSchedule: boolean;
        fieldServicePublicWitnessing: boolean;
        
        // Financial
        financial: boolean;
        financialAnalytics: boolean;
        financialBudget: boolean;
        financialContributions: boolean;
        financialExpenses: boolean;
        
        // Communication
        communication: boolean;
        communicationAnnouncements: boolean;
        communicationBroadcasts: boolean;
        communicationMessages: boolean;
        
        // Other Features
        territory: boolean;
        cleaning: boolean;
        transport: boolean;
        events: boolean;
        documents: boolean;
        documentForms: boolean;
        notifications: boolean;
        
        // AI Features
        aiAssistant: boolean;
        aiAnalytics: boolean;
        aiAssignments: boolean;
        aiInsights: boolean;
        
        // System
        history: boolean;
        trash: boolean;
        manageUser: boolean;
    };
}

async function _createRole(user: User, roleData: RoleData) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingRole = await Role.findOne({ name: roleData.name });
        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        const role = await Role.create(roleData);
        
        await logActivity({
            userId: user._id as string,
            type: 'role_create',
            action: `${user.fullName} created new role: ${roleData.name}`,
            details: { entityId: role._id, entityType: 'Role' },
        });

        revalidatePath('/dashboard/config/role');
        return JSON.parse(JSON.stringify(role));
    } catch (error) {
        console.log("Error creating role:", error);
        throw error;
    }
}

async function _getAllRoles(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const roles = await Role.find({}).sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(roles));
    } catch (error) {
        console.log("Error fetching roles:", error);
        throw error;
    }
}

async function _updateRole(user: User, roleId: string, roleData: RoleData) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const existingRole = await Role.findOne({ 
            name: roleData.name, 
            _id: { $ne: roleId } 
        });
        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        const role = await Role.findByIdAndUpdate(
            roleId,
            roleData,
            { new: true, runValidators: true }
        );

        if (!role) throw new Error("Role not found");
        
        await logActivity({
            userId: user._id as string,
            type: 'role_update',
            action: `${user.fullName} updated role: ${roleData.name}`,
            details: { entityId: roleId, entityType: 'Role' },
        });

        revalidatePath('/dashboard/config/role');
        return JSON.parse(JSON.stringify(role));
    } catch (error) {
        console.log("Error updating role:", error);
        throw error;
    }
}

async function _deleteRole(user: User, roleId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const role = await Role.findByIdAndDelete(roleId);
        if (!role) throw new Error("Role not found");
        
        await logActivity({
            userId: user._id as string,
            type: 'role_delete',
            action: `${user.fullName} deleted role: ${role.name}`,
            details: { entityId: roleId, entityType: 'Role' },
        });

        revalidatePath('/dashboard/config/role');
        return { success: true, message: "Role deleted successfully" };
    } catch (error) {
        console.log("Error deleting role:", error);
        throw error;
    }
}

async function _fetchRole(user: User, roleId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const role = await Role.findOne({name:roleId});
        if (!role) throw new Error("Role not found");

        return JSON.parse(JSON.stringify(role));
    } catch (error) {
        console.log("Error fetching role:", error);
        throw error;
    }
}

export const createRole = await withAuth(_createRole);
export const getAllRoles = await withAuth(_getAllRoles);
export const updateRole = await withAuth(_updateRole);
export const deleteRole = await withAuth(_deleteRole);
export const fetchRole = await withAuth(_fetchRole);