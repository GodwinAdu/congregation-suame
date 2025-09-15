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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Key, Loader2, Shield, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateMemberPrivileges } from "@/lib/actions/user.actions"
import { fetchAllPrivileges } from "@/lib/actions/privilege.actions"

interface PrivilegeDialogProps {
    memberId?: string
    currentPrivileges?: string[]
    memberName?: string
}

export function PrivilegeDialog({ memberId, currentPrivileges = [], memberName }: PrivilegeDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([])
    const [privileges, setPrivileges] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const loadPrivileges = async () => {
            try {
                const data = await fetchAllPrivileges()
                setPrivileges(data)
                // Initialize selected privileges after privileges are loaded
                const currentPrivilegeIds = Array.isArray(currentPrivileges) 
                    ? currentPrivileges.map(p => typeof p === 'string' ? p : p._id)
                    : []
                setSelectedPrivileges(currentPrivilegeIds)
            } catch (error) {
                console.error("Failed to fetch privileges:", error)
            }
        }
        loadPrivileges()
    }, [currentPrivileges])

    const handlePrivilegeChange = (privilegeId: string, checked: boolean) => {
        if (checked) {
            setSelectedPrivileges(prev => [...prev, privilegeId])
        } else {
            setSelectedPrivileges(prev => prev.filter(id => id !== privilegeId))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!memberId) return

        setIsLoading(true)
        try {
            await updateMemberPrivileges(memberId, selectedPrivileges)
            
            toast.success("Privileges updated successfully!", {
                description: `${memberName} now has ${selectedPrivileges.length} privilege(s)`
            })
            setOpen(false)
        } catch (error) {
            toast.error("Failed to update privileges", {
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
                    <Key className="h-4 w-4" />
                    Manage Privileges
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Manage Privileges</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {memberName ? `Update privileges for ${memberName}` : "Select privileges for this member"}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
                        <div className="space-y-3">
                            {privileges.map((privilege) => (
                                <div key={privilege._id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <Checkbox
                                        id={privilege._id}
                                        checked={selectedPrivileges.includes(privilege._id)}
                                        onCheckedChange={(checked) => handlePrivilegeChange(privilege._id, checked as boolean)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label 
                                            htmlFor={privilege._id} 
                                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4 text-purple-500" />
                                            {privilege.name}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {currentPrivileges.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Current Privileges:</span> {currentPrivileges.length} selected
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
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Privileges"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}