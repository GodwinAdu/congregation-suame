"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createRole, updateRole } from "@/lib/actions/role.actions"
import { RoleType } from "./columns"
import { Shield, Users, FileText, Calendar, Car, History, Trash, Settings, MapPin, DollarSign, MessageSquare, FolderOpen, Bot, Bell } from "lucide-react"
import React from "react"

const formSchema = z.object({
    name: z.string().min(1, "Role name is required").max(50, "Role name too long"),
    permissions: z.object({
        // Core Dashboard
        dashboard: z.boolean().default(false),
        publisherDashboard: z.boolean().default(true),
        profile: z.boolean().default(true),
        settings: z.boolean().default(true),
        resetPassword: z.boolean().default(true),
        
        // Configuration
        config: z.boolean().default(false),
        configDuties: z.boolean().default(false),
        configGroup: z.boolean().default(false),
        configPrivilege: z.boolean().default(false),
        configRole: z.boolean().default(false),
        updatePermissions: z.boolean().default(false),
        
        // Member Management
        manageAllMembers: z.boolean().default(false),
        manageGroupMembers: z.boolean().default(false),
        memberAnalytics: z.boolean().default(false),
        memberFamilies: z.boolean().default(false),
        
        // Reports
        manageAllReport: z.boolean().default(false),
        manageGroupReport: z.boolean().default(false),
        monthlyReport: z.boolean().default(false),
        monthlyReportHelpNeeded: z.boolean().default(false),
        overseerReports: z.boolean().default(false),
        overseerAnalytics: z.boolean().default(false),
        
        // Attendance
        manageAttendance: z.boolean().default(false),
        attendanceTracker: z.boolean().default(false),
        
        // Assignments & Meetings
        assignments: z.boolean().default(false),
        calendar: z.boolean().default(false),
        
        // Field Service
        fieldService: z.boolean().default(false),
        fieldServiceMeetingSchedule: z.boolean().default(false),
        fieldServicePublicWitnessing: z.boolean().default(false),
        
        // Financial
        financial: z.boolean().default(false),
        financialAnalytics: z.boolean().default(false),
        financialBudget: z.boolean().default(false),
        financialContributions: z.boolean().default(false),
        financialExpenses: z.boolean().default(false),
        
        // Communication
        communication: z.boolean().default(false),
        communicationAnnouncements: z.boolean().default(false),
        communicationBroadcasts: z.boolean().default(false),
        communicationMessages: z.boolean().default(false),
        
        // Other Features
        territory: z.boolean().default(false),
        cleaning: z.boolean().default(false),
        transport: z.boolean().default(false),
        events: z.boolean().default(false),
        documents: z.boolean().default(false),
        documentForms: z.boolean().default(false),
        notifications: z.boolean().default(false),
        
        // AI Features
        aiAssistant: z.boolean().default(false),
        aiAnalytics: z.boolean().default(false),
        aiAssignments: z.boolean().default(false),
        aiInsights: z.boolean().default(false),
        
        // System
        history: z.boolean().default(false),
        trash: z.boolean().default(false),
        manageUser: z.boolean().default(false)
    })
})

interface RoleModalProps {
    open: boolean
    onClose: () => void
    role: RoleType | null
    onSuccess: () => void
    mode: "create" | "edit"
}

const permissionGroups = [
    {
        title: "Core Access",
        icon: Settings,
        permissions: [
            { key: "dashboard", label: "Main Dashboard", description: "View main dashboard and statistics" },
            { key: "publisherDashboard", label: "Publisher Dashboard", description: "Access personal publisher dashboard" },
            { key: "profile", label: "Profile Access", description: "View and edit personal profile" },
            { key: "settings", label: "Settings", description: "Access notification and app settings" },
            { key: "resetPassword", label: "Reset Password", description: "Change account password" }
        ]
    },
    {
        title: "Configuration",
        icon: Shield,
        permissions: [
            { key: "config", label: "Configuration Access", description: "Access configuration section" },
            { key: "configDuties", label: "Manage Duties", description: "Configure congregation duties" },
            { key: "configGroup", label: "Manage Groups", description: "Configure field service groups" },
            { key: "configPrivilege", label: "Manage Privileges", description: "Configure member privileges" },
            { key: "configRole", label: "Manage Roles", description: "Configure user roles and permissions" },
            { key: "updatePermissions", label: "Update Permissions", description: "Modify system permissions" }
        ]
    },
    {
        title: "Member Management",
        icon: Users,
        permissions: [
            { key: "manageAllMembers", label: "All Members", description: "Full access to all member records" },
            { key: "manageGroupMembers", label: "Group Members", description: "Manage members within assigned groups" },
            { key: "memberAnalytics", label: "Member Analytics", description: "View member statistics and insights" },
            { key: "memberFamilies", label: "Family Management", description: "Manage family relationships" },
            { key: "manageUser", label: "User Accounts", description: "Create, edit, and delete user accounts" }
        ]
    },
    {
        title: "Reports & Analytics",
        icon: FileText,
        permissions: [
            { key: "manageAllReport", label: "All Reports", description: "Access all field service reports" },
            { key: "manageGroupReport", label: "Group Reports", description: "Manage reports within assigned groups" },
            { key: "monthlyReport", label: "Monthly Reports", description: "View monthly congregation statistics" },
            { key: "monthlyReportHelpNeeded", label: "Help Needed Reports", description: "Manage help needed tracking" },
            { key: "overseerReports", label: "Overseer Reports", description: "Create and manage overseer reports" },
            { key: "overseerAnalytics", label: "Overseer Analytics", description: "View overseer analytics and insights" }
        ]
    },
    {
        title: "Attendance & Meetings",
        icon: Calendar,
        permissions: [
            { key: "manageAttendance", label: "Attendance Management", description: "Track and manage meeting attendance" },
            { key: "attendanceTracker", label: "Attendance Tracker", description: "Access attendance tracking tools" },
            { key: "assignments", label: "Meeting Assignments", description: "Manage meeting assignments" },
            { key: "calendar", label: "Calendar Access", description: "View and manage calendar events" }
        ]
    },
    {
        title: "Field Service",
        icon: MapPin,
        permissions: [
            { key: "fieldService", label: "Field Service Access", description: "Access field service features" },
            { key: "fieldServiceMeetingSchedule", label: "Meeting Schedule", description: "Manage field service meeting schedules" },
            { key: "fieldServicePublicWitnessing", label: "Public Witnessing", description: "Manage public witnessing activities" },
            { key: "territory", label: "Territory Management", description: "Manage territories and assignments" }
        ]
    },
    {
        title: "Financial Management",
        icon: DollarSign,
        permissions: [
            { key: "financial", label: "Financial Access", description: "Access financial management" },
            { key: "financialAnalytics", label: "Financial Analytics", description: "View financial reports and analytics" },
            { key: "financialBudget", label: "Budget Management", description: "Manage budgets and planning" },
            { key: "financialContributions", label: "Contributions", description: "Manage contribution records" },
            { key: "financialExpenses", label: "Expense Management", description: "Manage expenses and approvals" }
        ]
    },
    {
        title: "Communication",
        icon: MessageSquare,
        permissions: [
            { key: "communication", label: "Communication Hub", description: "Access communication features" },
            { key: "communicationAnnouncements", label: "Announcements", description: "Create and manage announcements" },
            { key: "communicationBroadcasts", label: "Broadcasts", description: "Send broadcasts to congregation" },
            { key: "communicationMessages", label: "Messages", description: "Send and receive messages" }
        ]
    },
    {
        title: "Other Features",
        icon: FolderOpen,
        permissions: [
            { key: "cleaning", label: "Kingdom Hall Management", description: "Manage cleaning and maintenance" },
            { key: "transport", label: "Transport Management", description: "Manage transportation and fees" },
            { key: "events", label: "Events Management", description: "Manage events and activities" },
            { key: "documents", label: "Document Management", description: "Manage documents and files" },
            { key: "documentForms", label: "Forms Management", description: "Manage forms and templates" },
            { key: "notifications", label: "Notifications", description: "Manage notification system" }
        ]
    },
    {
        title: "AI Features",
        icon: Bot,
        permissions: [
            { key: "aiAssistant", label: "AI Assistant", description: "Access AI assistant features" },
            { key: "aiAnalytics", label: "AI Analytics", description: "View AI-powered analytics" },
            { key: "aiAssignments", label: "AI Assignments", description: "Use AI for assignment suggestions" },
            { key: "aiInsights", label: "AI Insights", description: "Access AI insights and recommendations" }
        ]
    },
    {
        title: "System Administration",
        icon: Shield,
        permissions: [
            { key: "history", label: "System History", description: "View system logs and activity" },
            { key: "trash", label: "Trash Management", description: "Access and restore deleted items" }
        ]
    }
]

export function RoleModal({ open, onClose, role, onSuccess, mode }: RoleModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            permissions: {
                dashboard: false,
                manageGroupMembers: false,
                manageAllReport: false,
                manageGroupReport: false,
                manageAllMembers: false,
                manageUser: false,
                manageAttendance: false,
                transport: false,
                history: false,
                trash: false,
            }
        },
    })

    // Reset form when role changes
    React.useEffect(() => {
        if (role && mode === "edit") {
            form.reset({
                name: role.name,
                permissions: role.permissions
            })
        } else {
            form.reset({
                name: "",
                permissions: {
                    // Core Dashboard
                    dashboard: false,
                    publisherDashboard: true,
                    profile: true,
                    settings: true,
                    resetPassword: true,
                    
                    // Configuration
                    config: false,
                    configDuties: false,
                    configGroup: false,
                    configPrivilege: false,
                    configRole: false,
                    updatePermissions: false,
                    
                    // Member Management
                    manageAllMembers: false,
                    manageGroupMembers: false,
                    memberAnalytics: false,
                    memberFamilies: false,
                    
                    // Reports
                    manageAllReport: false,
                    manageGroupReport: false,
                    monthlyReport: false,
                    monthlyReportHelpNeeded: false,
                    overseerReports: false,
                    overseerAnalytics: false,
                    
                    // Attendance
                    manageAttendance: false,
                    attendanceTracker: false,
                    
                    // Assignments & Meetings
                    assignments: false,
                    calendar: false,
                    
                    // Field Service
                    fieldService: false,
                    fieldServiceMeetingSchedule: false,
                    fieldServicePublicWitnessing: false,
                    
                    // Financial
                    financial: false,
                    financialAnalytics: false,
                    financialBudget: false,
                    financialContributions: false,
                    financialExpenses: false,
                    
                    // Communication
                    communication: false,
                    communicationAnnouncements: false,
                    communicationBroadcasts: false,
                    communicationMessages: false,
                    
                    // Other Features
                    territory: false,
                    cleaning: false,
                    transport: false,
                    events: false,
                    documents: false,
                    documentForms: false,
                    notifications: false,
                    
                    // AI Features
                    aiAssistant: false,
                    aiAnalytics: false,
                    aiAssignments: false,
                    aiInsights: false,
                    
                    // System
                    history: false,
                    trash: false,
                    manageUser: false
                }
            })
        }
    }, [role, mode, form])

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (mode === "create") {
                await createRole(values)
                toast.success("Role created successfully")
            } else {
                await updateRole(role!._id, values)
                toast.success("Role updated successfully")
            }
            
            form.reset()
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || `Failed to ${mode} role`)
            console.error(`Error ${mode}ing role:`, error)
        }
    }

    const watchedPermissions = form.watch("permissions")
    const activePermissions = Object.values(watchedPermissions).filter(Boolean).length

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95%] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {mode === "create" ? "Create New Role" : "Edit Role"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Define a new role with specific permissions for your organization"
                            : "Modify the role permissions and settings"
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Role Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter role name (e.g., Elder, Ministerial Servant)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        {/* Permissions Summary */}
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">Permissions Summary</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {activePermissions} of {Object.keys(watchedPermissions).length} permissions selected
                                    </p>
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                    {activePermissions}
                                </div>
                            </div>
                        </div>

                        {/* Permission Groups */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Role Permissions</h3>
                            
                            {permissionGroups.map((group) => (
                                <Card key={group.title}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <group.icon className="w-4 h-4" />
                                            {group.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {group.permissions.map((permission) => (
                                            <FormField
                                                key={permission.key}
                                                control={form.control}
                                                name={`permissions.${permission.key as keyof typeof watchedPermissions}`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none flex-1">
                                                            <FormLabel className="text-sm font-medium">
                                                                {permission.label}
                                                            </FormLabel>
                                                            <FormDescription className="text-xs">
                                                                {permission.description}
                                                            </FormDescription>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                disabled={isSubmitting} 
                                type="submit"
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    mode === "create" ? "Creating..." : "Updating..."
                                ) : (
                                    mode === "create" ? "Create Role" : "Update Role"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}