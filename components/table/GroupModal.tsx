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
import { Users, Loader2, UserPlus, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { updateMemberGroup } from "@/lib/actions/user.actions"
import { fetchAllGroups } from "@/lib/actions/group.actions"
import { getgroups } from "process"

interface GroupDialogProps {
    memberId?: string
    currentGroup?: string
    memberName?: string
}

export function GroupDialog({ memberId, currentGroup, memberName }: GroupDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(currentGroup || "")
    const [groups, setGroups] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Fetch available groups
        const fetchGroups = async () => {
            try {
                // Replace with actual API call
                const groups = await fetchAllGroups()
                setGroups(groups)
            } catch (error) {
                console.error("Failed to fetch groups:", error)
            }
        }
        fetchGroups()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGroup || !memberId) return

        setIsLoading(true)
        try {
            await updateMemberGroup(memberId, selectedGroup)

            const groupName = groups.find(g => g._id === selectedGroup)?.name
            toast.success("Group assigned successfully!", {
                description: `${memberName} has been added to ${groupName}`
            })
            setOpen(false)
        } catch (error) {
            toast.error("Failed to assign group", {
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
                    <Users className="h-4 w-4" />
                    Assign Group
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">Assign to Group</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            {memberName ? `Add ${memberName} to a group` : "Select a group for this member"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="group" className="text-sm font-medium">Select Group</Label>
                            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Choose a group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((group) => (
                                        <SelectItem key={group._id} value={group._id}>
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="font-medium">{group.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-6">{group.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {currentGroup && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Current Group:</span> {currentGroup}
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
                            disabled={isLoading || !selectedGroup}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign Group"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
