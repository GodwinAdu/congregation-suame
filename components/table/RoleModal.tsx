"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, User, Shield, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateMemberRole } from "@/lib/actions/user.actions"
import { getAllRoles } from "@/lib/actions/role.actions"

interface RoleDialogProps {
    memberId?: string
    currentRole?: string
    memberName?: string
}

export function RoleDialog({ memberId, currentRole, memberName }: RoleDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(currentRole || "")
    const [roles, setRoles] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const data = await getAllRoles()
                setRoles(data)
            } catch (error) {
                console.error("Failed to fetch roles:", error)
            }
        }
        loadRoles()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRole || !memberId) return

        setIsLoading(true)
        try {
            await updateMemberRole(memberId, selectedRole)
            
            toast.success("Role assigned successfully!", {
                description: `${memberName} has been assigned the role of ${roles.find(r => r._id === selectedRole)?.name}`
            })
            setOpen(false)
        } catch (error) {
            toast.error("Failed to assign role", {
                description: error instanceof Error ? error.message : "Please try again later"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors">
                    <Shield className="h-4 w-4" />
                    Assign Role
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Assign Role</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {memberName ? `Assign a new role to ${memberName}` : "Select a role for this member"}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">Select Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="publisher">publisher</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role._id} value={role.name}>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                {role.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {currentRole && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Current Role:</span> {currentRole}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !selectedRole}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign Role"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
