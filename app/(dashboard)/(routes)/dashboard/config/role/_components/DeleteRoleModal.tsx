"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { deleteRole } from "@/lib/actions/role.actions"
import { RoleType } from "./columns"
import { AlertTriangle, Trash2, Shield } from "lucide-react"
import { useState } from "react"

interface DeleteRoleModalProps {
    open: boolean
    onClose: () => void
    role: RoleType | null
    onSuccess: () => void
}

export function DeleteRoleModal({ open, onClose, role, onSuccess }: DeleteRoleModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!role) return

        setIsDeleting(true)
        try {
            await deleteRole(role._id)
            toast.success("Role deleted successfully")
            onClose()
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete role")
            console.error("Error deleting role:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    if (!role) return null

    const activePermissions = Object.values(role.permissions).filter(Boolean).length

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] w-[96%]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-5 h-5" />
                        Delete Role
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Please confirm you want to delete this role.
                    </DialogDescription>
                </DialogHeader>

                {/* Role Information */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{role.name}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                        <div>Created: {new Date(role.createdAt).toLocaleDateString()}</div>
                        <div>Permissions: {activePermissions} active</div>
                    </div>
                </div>

                {/* Warning */}
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Warning:</strong> Deleting this role will remove it from the system permanently. 
                        Any users assigned to this role may lose their permissions.
                    </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onClose}
                        className="flex-1"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1"
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete Role
                            </div>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}