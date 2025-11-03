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
        dashboard: z.boolean().default(false),
        publisherDashboard: z.boolean().default(true),
        config: z.boolean().default(false),
        manageGroupMembers: z.boolean().default(false),
        manageAllReport: z.boolean().default(false),
        manageGroupReport: z.boolean().default(false),
        manageAllMembers: z.boolean().default(false),
        manageUser: z.boolean().default(false),
        manageAttendance: z.boolean().default(false),
        transport: z.boolean().default(false),
        history: z.boolean().default(false),
        trash: z.boolean().default(false),
        monthlyReport: z.boolean().default(false),
        assignments: z.boolean().default(false),
        cleaning: z.boolean().default(false),
        territory: z.boolean().default(false),
        financial: z.boolean().default(false),
        communication: z.boolean().default(false),
        events: z.boolean().default(false),
        documents: z.boolean().default(false),
        aiAssistant: z.boolean().default(false),
        notifications: z.boolean().default(false),
        overseerReports: z.boolean().default(false),
        overseerAnalytics: z.boolean().default(false),
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
        title: "Dashboard & Overview",
        icon: Settings,
        permissions: [
            { key: "dashboard", label: "Dashboard Access", description: "View main dashboard and statistics" },
            { key: "publisherDashboard", label: "Publisher Dashboard", description: "Access personal publisher dashboard and reports" }
        ]
    },
    {
        title: "Member Management",
        icon: Users,
        permissions: [
            { key: "manageAllMembers", label: "Manage All Members", description: "Full access to all member records" },
            { key: "manageGroupMembers", label: "Manage Group Members", description: "Manage members within assigned groups" },
            { key: "manageUser", label: "User Management", description: "Create, edit, and delete user accounts" },
            {key:"config", label:"Configuration", description:"Manage Role, Groups and Privileges in the congregation"}
        ]
    },
    {
        title: "Reports & Documentation",
        icon: FileText,
        permissions: [
            { key: "manageAllReport", label: "Manage All Reports", description: "Access and manage all field service reports" },
            { key: "manageGroupReport", label: "Manage Group Reports", description: "Manage reports within assigned groups" },
            { key: "monthlyReport", label: "Monthly Reports", description: "View monthly congregation statistics and reports" },
            { key: "overseerReports", label: "Overseer Reports", description: "Create and manage field service overseer reports" },
            { key: "overseerAnalytics", label: "Overseer Analytics", description: "View analytics and insights for overseer reports" }
        ]
    },
    {
        title: "Activities & Events",
        icon: Calendar,
        permissions: [
            { key: "manageAttendance", label: "Manage Attendance", description: "Track and manage meeting attendance" },
            { key: "transport", label: "Transport Management", description: "Manage transportation and payments" },
            { key: "assignments", label: "Meeting Assignments", description: "Manage meeting assignments and schedules" },
            { key: "cleaning", label: "Kingdom Hall Management", description: "Manage cleaning tasks and inventory" }
        ]
    },
    {
        title: "Territory & Field Service",
        icon: MapPin,
        permissions: [
            { key: "territory", label: "Territory Management", description: "Manage territories, assignments, and return visits" }
        ]
    },
    {
        title: "Financial Management",
        icon: DollarSign,
        permissions: [
            { key: "financial", label: "Financial Management", description: "Manage contributions, expenses, and budgets" }
        ]
    },
    {
        title: "Communication & Events",
        icon: MessageSquare,
        permissions: [
            { key: "communication", label: "Communication Hub", description: "Send messages, announcements, and broadcasts" },
            { key: "events", label: "Events & Calendar", description: "Manage events and calendar scheduling" },
            { key: "notifications", label: "Notifications", description: "Manage notification preferences and delivery" }
        ]
    },
    {
        title: "Documents & AI",
        icon: FolderOpen,
        permissions: [
            { key: "documents", label: "Document Management", description: "Manage documents, forms, and file sharing" },
            { key: "aiAssistant", label: "AI Assistant", description: "Access AI-powered insights and suggestions" }
        ]
    },
    {
        title: "System & Maintenance",
        icon: Shield,
        permissions: [
            { key: "history", label: "System History", description: "View system logs and activity history" },
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
                    dashboard: false,
                    publisherDashboard: true,
                    config: false,
                    manageGroupMembers: false,
                    manageAllReport: false,
                    manageGroupReport: false,
                    manageAllMembers: false,
                    manageUser: false,
                    manageAttendance: false,
                    transport: false,
                    history: false,
                    trash: false,
                    monthlyReport: false,
                    assignments: false,
                    cleaning: false,
                    territory: false,
                    financial: false,
                    communication: false,
                    events: false,
                    documents: false,
                    aiAssistant: false,
                    notifications: false,
                    overseerReports: false,
                    overseerAnalytics: false,
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