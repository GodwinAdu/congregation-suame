"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateAllRolesWithNewPermissions } from "@/lib/actions/update-roles.actions"

export default function UpdatePermissionsPage() {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdate = async () => {
        setIsUpdating(true)
        try {
            const result = await updateAllRolesWithNewPermissions()
            if (result.success) {
                toast.success(result.message)
                toast.success("Please refresh the page to see new sidebar items")
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Failed to update permissions")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Update Role Permissions</h1>
                    <p className="text-muted-foreground text-lg">
                        Add new feature permissions to existing roles
                    </p>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Enable New Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Click the button below to add permissions for all the new powerful features:
                        </p>
                        
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Territory Management</li>
                            <li>Financial Management</li>
                            <li>Communication Hub</li>
                            <li>Events & Calendar</li>
                            <li>Document Management</li>
                            <li>AI Assistant</li>
                            <li>Notifications</li>
                        </ul>
                        
                        <Button 
                            onClick={handleUpdate}
                            disabled={isUpdating}
                            className="w-full"
                            size="lg"
                        >
                            {isUpdating ? "Updating..." : "Update All Role Permissions"}
                        </Button>
                        
                        <p className="text-xs text-muted-foreground">
                            This will enable all new features for all existing roles. You can customize individual role permissions later.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}