import { model, models, Schema } from "mongoose";

export interface IRole {
    _id: string;
    name: string;
    dashboard: boolean;
    publisherDashboard: boolean;
    config: boolean;
    manageGroupMembers: boolean;
    manageAllReport: boolean;
    manageGroupReport: boolean;
    manageAllMembers: boolean;
    manageUser: boolean;
    manageAttendance: boolean;
    transport: boolean;
    history: boolean;
    trash: boolean;
    monthlyReport: boolean;
    assignments: boolean;
    cleaning: boolean;
    territory: boolean;
    financial: boolean;
    communication: boolean;
    events: boolean;
    documents: boolean;
    aiAssistant: boolean;
    notifications: boolean;
    overseerReports: boolean;
    overseerAnalytics: boolean;
    calendar: boolean;
    fieldService: boolean;
    memberAnalytics: boolean;
    memberFamilies: boolean;
    profile: boolean;
    settings: boolean;
    updatePermissions: boolean;
    resetPassword: boolean;
    aiAnalytics: boolean;
    aiAssignments: boolean;
    aiInsights: boolean;
    attendanceTracker: boolean;
    territoryView: boolean;
    territoryManage: boolean;
    territoryAssign: boolean;
    territoryAnalytics: boolean;
    territoryImport: boolean;
    coVisitView: boolean;
    coVisitManage: boolean;
    coVisitSchedule: boolean;
    monthlyReportHelpNeeded: boolean;
    documentForms: boolean;
    financialAnalytics: boolean;
    financialBudget: boolean;
    financialContributions: boolean;
    financialExpenses: boolean;
    communicationAnnouncements: boolean;
    communicationBroadcasts: boolean;
    communicationMessages: boolean;
    fieldServiceMeetingSchedule: boolean;
    fieldServicePublicWitnessing: boolean;
    configDuties: boolean;
    configGroup: boolean;
    configPrivilege: boolean;
    configRole: boolean;
}

const RoleSchema = new Schema({
    name: String,
    permissions: {
        // Core Dashboard
        dashboard: { type: Boolean, default: false },
        publisherDashboard: { type: Boolean, default: true },
        profile: { type: Boolean, default: true },
        settings: { type: Boolean, default: true },
        resetPassword: { type: Boolean, default: true },
        
        // Configuration
        config: { type: Boolean, default: false },
        configDuties: { type: Boolean, default: false },
        configGroup: { type: Boolean, default: false },
        configPrivilege: { type: Boolean, default: false },
        configRole: { type: Boolean, default: false },
        updatePermissions: { type: Boolean, default: false },
        
        // Member Management
        manageAllMembers: { type: Boolean, default: false },
        manageGroupMembers: { type: Boolean, default: false },
        memberAnalytics: { type: Boolean, default: false },
        memberFamilies: { type: Boolean, default: false },
        
        // Reports
        manageAllReport: { type: Boolean, default: false },
        manageGroupReport: { type: Boolean, default: false },
        monthlyReport: { type: Boolean, default: false },
        monthlyReportHelpNeeded: { type: Boolean, default: false },
        overseerReports: { type: Boolean, default: false },
        overseerAnalytics: { type: Boolean, default: false },
        
        // Attendance
        manageAttendance: { type: Boolean, default: false },
        attendanceTracker: { type: Boolean, default: false },
        
        // Assignments & Meetings
        assignments: { type: Boolean, default: false },
        calendar: { type: Boolean, default: false },
        
        // Field Service
        fieldService: { type: Boolean, default: false },
        fieldServiceMeetingSchedule: { type: Boolean, default: false },
        fieldServicePublicWitnessing: { type: Boolean, default: false },
        
        // Financial
        financial: { type: Boolean, default: false },
        financialAnalytics: { type: Boolean, default: false },
        financialBudget: { type: Boolean, default: false },
        financialContributions: { type: Boolean, default: false },
        financialExpenses: { type: Boolean, default: false },
        
        // Communication
        communication: { type: Boolean, default: false },
        communicationAnnouncements: { type: Boolean, default: false },
        communicationBroadcasts: { type: Boolean, default: false },
        communicationMessages: { type: Boolean, default: false },
        
        // Territory Management
        territory: { type: Boolean, default: false },
        territoryView: { type: Boolean, default: false },
        territoryManage: { type: Boolean, default: false },
        territoryAssign: { type: Boolean, default: false },
        territoryAnalytics: { type: Boolean, default: false },
        territoryImport: { type: Boolean, default: false },
        
        // CO Visit Management
        coVisitView: { type: Boolean, default: false },
        coVisitManage: { type: Boolean, default: false },
        coVisitSchedule: { type: Boolean, default: false },
        
        // Other Features
        cleaning: { type: Boolean, default: false },
        transport: { type: Boolean, default: false },
        events: { type: Boolean, default: false },
        documents: { type: Boolean, default: false },
        documentForms: { type: Boolean, default: false },
        notifications: { type: Boolean, default: false },
        
        // AI Features
        aiAssistant: { type: Boolean, default: false },
        aiAnalytics: { type: Boolean, default: false },
        aiAssignments: { type: Boolean, default: false },
        aiInsights: { type: Boolean, default: false },
        
        // System
        history: { type: Boolean, default: false },
        trash: { type: Boolean, default: false },
        manageUser: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});


const Role = models.Role ?? model("Role", RoleSchema);

export default Role;