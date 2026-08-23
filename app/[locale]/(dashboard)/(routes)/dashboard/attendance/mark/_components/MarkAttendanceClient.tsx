"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, CheckCircle2, Users, Save, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { recordMemberAttendance, getMemberAttendanceForDate } from '@/lib/actions/attendance-analytics.actions'
import { getMeetingSchedules } from '@/lib/actions/meeting-schedule.actions'

interface Member {
    _id: string
    fullName: string
    groupId?: { _id: string; name: string }
}

interface MemberStatus {
    status: 'present' | 'late' | 'absent'
    arrivalTime?: string
}

interface MeetingSchedule {
    meetingType: 'Midweek' | 'Weekend'
    day: string
    startTime: string
    endTime: string
    gracePeriodMinutes: number
}

interface MarkAttendanceClientProps {
    members: Member[]
}

export function MarkAttendanceClient({ members }: MarkAttendanceClientProps) {
    const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().split('T')[0])
    const [meetingType, setMeetingType] = useState<'Midweek' | 'Weekend'>(() => {
        const day = new Date().getDay()
        return (day >= 1 && day <= 5) ? 'Midweek' : 'Weekend'
    })
    const [memberStatuses, setMemberStatuses] = useState<Record<string, MemberStatus>>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [schedules, setSchedules] = useState<MeetingSchedule[]>([])

    // Load meeting schedules
    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const data = await getMeetingSchedules()
                setSchedules(data)
            } catch {
                // Defaults will be created on first access
            }
        }
        loadSchedules()
    }, [])

    // Load existing attendance for selected date
    useEffect(() => {
        const loadExisting = async () => {
            setLoading(true)
            try {
                const existingIds = await getMemberAttendanceForDate(meetingDate)
                // Set existing as present (we'll improve this to load full status later)
                const statuses: Record<string, MemberStatus> = {}
                existingIds.forEach((id: string) => {
                    statuses[id] = { status: 'present' }
                })
                setMemberStatuses(statuses)
            } catch {
                setMemberStatuses({})
            } finally {
                setLoading(false)
            }
        }
        loadExisting()
    }, [meetingDate])

    // Get current meeting schedule info
    const currentSchedule = schedules.find(s => s.meetingType === meetingType)

    const filteredMembers = members.filter(m =>
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.groupId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleStatusChange = (memberId: string, status: 'present' | 'late' | 'absent') => {
        setMemberStatuses(prev => {
            if (status === 'absent') {
                const newStatuses = { ...prev }
                delete newStatuses[memberId]
                return newStatuses
            }
            return {
                ...prev,
                [memberId]: {
                    status,
                    arrivalTime: status === 'late' ? prev[memberId]?.arrivalTime : undefined
                }
            }
        })
    }

    const handleArrivalTime = (memberId: string, time: string) => {
        setMemberStatuses(prev => ({
            ...prev,
            [memberId]: { ...prev[memberId], arrivalTime: time }
        }))
    }

    const handleMarkAllPresent = () => {
        const statuses: Record<string, MemberStatus> = {}
        filteredMembers.forEach(m => { statuses[m._id] = { status: 'present' } })
        setMemberStatuses(statuses)
    }

    const handleClearAll = () => {
        setMemberStatuses({})
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const membersData = Object.entries(memberStatuses).map(([memberId, data]) => ({
                memberId,
                status: data.status,
                arrivalTime: data.arrivalTime,
            }))

            const result = await recordMemberAttendance({
                meetingDate,
                meetingType,
                members: membersData
            })

            toast.success(`Attendance saved: ${result.count} present${result.lateCount > 0 ? ` (${result.lateCount} late)` : ''}`)
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save attendance')
        } finally {
            setSaving(false)
        }
    }

    const presentCount = Object.values(memberStatuses).filter(s => s.status === 'present').length
    const lateCount = Object.values(memberStatuses).filter(s => s.status === 'late').length
    const totalMarked = presentCount + lateCount

    // Group members by their group
    const groupedMembers = filteredMembers.reduce((acc, member) => {
        const group = member.groupId?.name || 'Unassigned'
        if (!acc[group]) acc[group] = []
        acc[group].push(member)
        return acc
    }, {} as Record<string, Member[]>)

    const getStatusStyle = (memberId: string) => {
        const memberStatus = memberStatuses[memberId]
        if (!memberStatus) return 'hover:bg-muted/50'
        if (memberStatus.status === 'present') return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30'
        if (memberStatus.status === 'late') return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800/30'
        return ''
    }

    return (
        <div className="space-y-6">
            {/* Meeting Details */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <Label htmlFor="date">Meeting Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Meeting Type</Label>
                            <Select value={meetingType} onValueChange={(v: 'Midweek' | 'Weekend') => setMeetingType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Midweek">Midweek Meeting</SelectItem>
                                    <SelectItem value="Weekend">Weekend Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            {currentSchedule && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="capitalize">{currentSchedule.day}</span>
                                    <span>{currentSchedule.startTime} – {currentSchedule.endTime}</span>
                                </div>
                            )}
                            {currentSchedule && (
                                <p className="text-xs text-muted-foreground">
                                    Grace period: {currentSchedule.gracePeriodMinutes} min
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {presentCount}
                            </Badge>
                            <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:text-yellow-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {lateCount}
                            </Badge>
                            <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {totalMarked}/{members.length}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Member Selection */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle>Mark Attendance</CardTitle>
                            <CardDescription>Tap a member to cycle: Absent → Present → Late → Absent</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                                All Present
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleClearAll}>
                                Clear All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-muted-foreground">Loading...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 max-h-[500px] overflow-y-auto">
                            {Object.entries(groupedMembers).sort().map(([group, groupMembers]) => (
                                <div key={group}>
                                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-background py-1 z-10">
                                        <Badge variant="outline" className="text-xs">{group}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            ({groupMembers.filter(m => memberStatuses[m._id]).length}/{groupMembers.length})
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {groupMembers.map(member => {
                                            const status = memberStatuses[member._id]
                                            return (
                                                <div
                                                    key={member._id}
                                                    className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${getStatusStyle(member._id)}`}
                                                >
                                                    <div
                                                        className="flex-1 cursor-pointer select-none"
                                                        onClick={() => {
                                                            if (!status) handleStatusChange(member._id, 'present')
                                                            else if (status.status === 'present') handleStatusChange(member._id, 'late')
                                                            else handleStatusChange(member._id, 'absent')
                                                        }}
                                                    >
                                                        <span className="text-sm font-medium">{member.fullName}</span>
                                                    </div>

                                                    {/* Status buttons */}
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant={status?.status === 'present' ? 'default' : 'ghost'}
                                                            size="sm"
                                                            className={`h-7 px-2 text-xs ${status?.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                            onClick={() => handleStatusChange(member._id, 'present')}
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant={status?.status === 'late' ? 'default' : 'ghost'}
                                                            size="sm"
                                                            className={`h-7 px-2 text-xs ${status?.status === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                                                            onClick={() => handleStatusChange(member._id, 'late')}
                                                        >
                                                            <Clock className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    {/* Arrival time for late members */}
                                                    {status?.status === 'late' && (
                                                        <Input
                                                            type="time"
                                                            value={status.arrivalTime || ''}
                                                            onChange={(e) => handleArrivalTime(member._id, e.target.value)}
                                                            className="w-24 h-7 text-xs"
                                                        />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="sticky bottom-4">
                <Button
                    onClick={handleSave}
                    disabled={saving || totalMarked === 0}
                    className="w-full sm:w-auto shadow-lg"
                    size="lg"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : `Save Attendance (${presentCount} present, ${lateCount} late)`}
                </Button>
            </div>
        </div>
    )
}
