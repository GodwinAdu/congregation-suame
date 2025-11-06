import { connectToDB } from '../lib/mongoose.js';
import Role from '../lib/models/role.models.js';

async function updateRolePermissions() {
    try {
        await connectToDB();
        
        console.log('Starting role permissions update...');
        
        const roles = await Role.find({});
        console.log(`Found ${roles.length} roles to update`);
        
        for (const role of roles) {
            const updatedPermissions = {
                // Core Dashboard - keep existing or set defaults
                dashboard: role.permissions?.dashboard || false,
                publisherDashboard: role.permissions?.publisherDashboard !== undefined ? role.permissions.publisherDashboard : true,
                profile: true, // Always allow profile access
                settings: true, // Always allow settings access
                resetPassword: true, // Always allow password reset
                
                // Configuration
                config: role.permissions?.config || false,
                configDuties: role.permissions?.config || false, // Inherit from config
                configGroup: role.permissions?.config || false,
                configPrivilege: role.permissions?.config || false,
                configRole: role.permissions?.config || false,
                updatePermissions: role.permissions?.config || false,
                
                // Member Management
                manageAllMembers: role.permissions?.manageAllMembers || false,
                manageGroupMembers: role.permissions?.manageGroupMembers || false,
                memberAnalytics: role.permissions?.manageAllMembers || false, // Inherit from manageAllMembers
                memberFamilies: role.permissions?.manageAllMembers || role.permissions?.manageGroupMembers || false,
                
                // Reports
                manageAllReport: role.permissions?.manageAllReport || false,
                manageGroupReport: role.permissions?.manageGroupReport || false,
                monthlyReport: role.permissions?.monthlyReport || false,
                monthlyReportHelpNeeded: role.permissions?.monthlyReport || false,
                overseerReports: role.permissions?.overseerReports || false,
                overseerAnalytics: role.permissions?.overseerAnalytics || false,
                
                // Attendance
                manageAttendance: role.permissions?.manageAttendance || false,
                attendanceTracker: role.permissions?.manageAttendance || false,
                
                // Assignments & Meetings
                assignments: role.permissions?.assignments || false,
                calendar: role.permissions?.assignments || false, // Link calendar to assignments
                
                // Field Service
                fieldService: role.permissions?.territory || false, // Use territory as base
                fieldServiceMeetingSchedule: role.permissions?.assignments || false,
                fieldServicePublicWitnessing: role.permissions?.territory || false,
                
                // Financial
                financial: role.permissions?.financial || false,
                financialAnalytics: role.permissions?.financial || false,
                financialBudget: role.permissions?.financial || false,
                financialContributions: role.permissions?.financial || false,
                financialExpenses: role.permissions?.financial || false,
                
                // Communication
                communication: role.permissions?.communication || false,
                communicationAnnouncements: role.permissions?.communication || false,
                communicationBroadcasts: role.permissions?.communication || false,
                communicationMessages: role.permissions?.communication || false,
                
                // Other Features
                territory: role.permissions?.territory || false,
                cleaning: role.permissions?.cleaning || false,
                transport: role.permissions?.transport || false,
                events: role.permissions?.events || false,
                documents: role.permissions?.documents || false,
                documentForms: role.permissions?.documents || false,
                notifications: role.permissions?.notifications || false,
                
                // AI Features
                aiAssistant: role.permissions?.aiAssistant || false,
                aiAnalytics: role.permissions?.aiAssistant || false,
                aiAssignments: role.permissions?.aiAssistant || false,
                aiInsights: role.permissions?.aiAssistant || false,
                
                // System
                history: role.permissions?.history || false,
                trash: role.permissions?.trash || false,
                manageUser: role.permissions?.manageUser || false
            };
            
            await Role.findByIdAndUpdate(role._id, {
                permissions: updatedPermissions
            });
            
            console.log(`Updated role: ${role.name}`);
        }
        
        console.log('Role permissions update completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('Error updating role permissions:', error);
        process.exit(1);
    }
}

updateRolePermissions().catch(console.error);