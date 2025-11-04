"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Users, BookOpen, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateAssignment, fetchAssignmentsByWeek } from "@/lib/actions/assignment.actions"
import { getEligibleMembersForAssignment } from "@/lib/actions/member-duties.actions"
import { AddAssignmentModal } from "./add-assignment-modal"
import { EligibleMemberSelect } from "./eligible-member-select"

interface Assignment {
    _id: string
    week: string
    meetingType: "Midweek" | "Weekend"
    assignmentType: "Watchtower Reader" | "Bible Student Reader" | "Life and Ministry" | "Public Talk Speaker"
    title: string
    description?: string
    assignedTo?: { _id: string; fullName: string }
    assistant?: { _id: string; fullName: string }
    duration?: number
    source?: string
}

interface Member {
    _id: string
    fullName: string
    gender: string
}

interface AssignmentManagerProps {
    initialAssignments: Assignment[]
    members: Member[]
    currentWeek: string
}

export function AssignmentManager({ initialAssignments, members, currentWeek }: AssignmentManagerProps) {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
    const [selectedWeek, setSelectedWeek] = useState(currentWeek)
    const [showAddModal, setShowAddModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [eligibleMembersCache, setEligibleMembersCache] = useState<Record<string, Member[]>>({})
    const router = useRouter()

    // Update assignments when currentWeek prop changes
    useEffect(() => {
        setAssignments(initialAssignments)
        setSelectedWeek(currentWeek)
    }, [initialAssignments, currentWeek])

    const handleWeekChange = async (direction: 'prev' | 'next') => {
        const current = new Date(selectedWeek)
        const newDate = new Date(current)
        newDate.setDate(current.getDate() + (direction === 'next' ? 7 : -7))
        const newWeek = newDate.toISOString().split('T')[0]
        
        setIsLoading(true)
        setSelectedWeek(newWeek)
        
        try {
            // Fetch assignments for the new week
            const newAssignments = await fetchAssignmentsByWeek(newWeek)
            setAssignments(newAssignments)
            
            // Update URL without full page reload
            router.push(`/dashboard/assignments?week=${newWeek}`, { scroll: false })
        } catch (error: any) {
            toast.error(error.message || "Failed to load assignments")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAssignMember = async (assignmentId: string, memberId: string, type: 'assignedTo' | 'assistant') => {
        try {
            await updateAssignment(assignmentId, { [type]: memberId })
            
            setAssignments(prev => prev.map(assignment => 
                assignment._id === assignmentId 
                    ? { 
                        ...assignment, 
                        [type]: members.find(m => m._id === memberId) 
                      }
                    : assignment
            ))
            
            toast.success("Assignment updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update assignment")
        }
    }

    const handleAddSuccess = async () => {
        try {
            // Refresh assignments for current week
            const newAssignments = await fetchAssignmentsByWeek(selectedWeek)
            setAssignments(newAssignments)
            toast.success("Assignment added successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to refresh assignments")
        }
    }

    const getEligibleMembersForAssignmentType = async (assignmentType: string) => {
        if (eligibleMembersCache[assignmentType]) {
            return eligibleMembersCache[assignmentType]
        }

        try {
            const result = await getEligibleMembersForAssignment(assignmentType)
            if (result.success) {
                setEligibleMembersCache(prev => ({
                    ...prev,
                    [assignmentType]: result.members
                }))
                return result.members
            }
        } catch (error) {
            console.error('Error fetching eligible members:', error)
        }
        
        return members // Fallback to all members
    }

    const formatWeekRange = (weekStart: string) => {
        const start = new Date(weekStart)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    const midweekAssignments = assignments.filter(a => a.meetingType === "Midweek")
    const weekendAssignments = assignments.filter(a => a.meetingType === "Weekend")

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground">Meeting Assignments</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Manage Watchtower readers, Bible student readers, and Life & Ministry assignments
                    </p>

                    {/* Week Navigation */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline" 
                                onClick={() => handleWeekChange('prev')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Previous Week
                            </Button>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Week of</p>
                                <p className="font-semibold">{formatWeekRange(selectedWeek)}</p>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => handleWeekChange('next')}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Next Week
                            </Button>
                        </div>
                        
                        {/* Add Assignment Button */}
                        <Button 
                            onClick={() => setShowAddModal(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Assignment
                        </Button>
                    </div>
                </div>

                {/* Midweek Meeting */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Midweek Meeting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Skeleton className="h-10 w-full" />
                                                <Skeleton className="h-10 w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : midweekAssignments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No assignments for this week. Add assignments to get started.
                                </p>
                            ) : (
                                midweekAssignments.map((assignment) => (
                                    <div key={assignment._id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {assignment.assignmentType}
                                                    </Badge>
                                                    {assignment.duration && (
                                                        <Badge variant="outline">
                                                            {assignment.duration} min
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold">{assignment.title}</h3>
                                                {assignment.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {assignment.description}
                                                    </p>
                                                )}
                                                {assignment.source && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Source: {assignment.source}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Assigned To</Label>
                                                <EligibleMemberSelect
                                                    assignmentType={assignment.assignmentType}
                                                    value={assignment.assignedTo?._id || ""}
                                                    onValueChange={(value) => handleAssignMember(assignment._id, value, 'assignedTo')}
                                                    getEligibleMembers={getEligibleMembersForAssignmentType}
                                                    placeholder="Select member"
                                                />
                                            </div>
                                            
                                            {assignment.assignmentType === "Life and Ministry" && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Assistant</Label>
                                                    <Select
                                                        value={assignment.assistant?._id || ""}
                                                        onValueChange={(value) => handleAssignMember(assignment._id, value, 'assistant')}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select assistant" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {members.map((member) => (
                                                                <SelectItem key={member._id} value={member._id}>
                                                                    {member.fullName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Weekend Meeting */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Weekend Meeting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-6 w-24" />
                                                <Skeleton className="h-6 w-16" />
                                            </div>
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            ) : weekendAssignments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No assignments for this week. Add assignments to get started.
                                </p>
                            ) : (
                                weekendAssignments.map((assignment) => (
                                    <div key={assignment._id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {assignment.assignmentType}
                                                    </Badge>
                                                    {assignment.duration && (
                                                        <Badge variant="outline">
                                                            {assignment.duration} min
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold">{assignment.title}</h3>
                                                {assignment.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {assignment.description}
                                                    </p>
                                                )}
                                                {assignment.source && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Source: {assignment.source}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Assigned To</Label>
                                            <EligibleMemberSelect
                                                assignmentType={assignment.assignmentType}
                                                value={assignment.assignedTo?._id || ""}
                                                onValueChange={(value) => handleAssignMember(assignment._id, value, 'assignedTo')}
                                                getEligibleMembers={getEligibleMembersForAssignmentType}
                                                placeholder="Select member"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Add Assignment Modal */}
                <AddAssignmentModal
                    open={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    week={selectedWeek}
                    members={members}
                    onSuccess={handleAddSuccess}
                />
            </div>
        </div>
    )
}