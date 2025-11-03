"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Clock, MapPin } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { updateGroupSchedule, getGroupSchedulesForModal } from '@/lib/actions/overseer.actions'

interface OverseerScheduleModalProps {
    open: boolean
    onClose: () => void
}



interface Group {
    _id: string
    name: string
}

interface ScheduleItem {
    groupId: string
    groupName: string
    month: string
    monthLabel: string
    scheduledDate: string
    status: string
}

export function OverseerScheduleModal({ open, onClose }: OverseerScheduleModalProps) {
    const [groups, setGroups] = useState<Group[]>([])
    const [schedules, setSchedules] = useState<ScheduleItem[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)

    // Fetch data when modal opens
    useEffect(() => {
        const fetchData = async () => {
            if (!open) return

            setLoadingData(true)
            try {
                const result = await getGroupSchedulesForModal()
                if (result.success) {
                    setGroups(result.groups)
                    setSchedules(result.schedules)
                }
            } catch (error) {
                console.error('Error fetching schedule data:', error)
                toast.error('Failed to load schedule data')
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [open])

    const handleScheduleUpdate = (groupId: string, month: string, date: string) => {
        setSchedules(prev => prev.map(schedule =>
            schedule.groupId === groupId && schedule.month === month
                ? { ...schedule, scheduledDate: date, status: date ? 'scheduled' as const : 'pending' as const }
                : schedule
        ))
    }

    const handleSaveSchedule = async () => {
        setLoading(true)
        try {
            const scheduleData = schedules
                .filter(schedule => schedule.scheduledDate && schedule.scheduledDate.trim() !== '') // Only save schedules with valid dates
                .map(schedule => ({
                    groupId: schedule.groupId,
                    month: schedule.month,
                    scheduledDate: schedule.scheduledDate,
                    status: schedule.status as 'scheduled' | 'completed' | 'pending'
                }))

            console.log('Saving schedules:', scheduleData) // Debug log

            if (scheduleData.length === 0) {
                toast.error('Please set at least one visit date')
                return
            }

            const result = await updateGroupSchedule(scheduleData)

            if (result.success) {
                toast.success(`${scheduleData.length} group schedule(s) saved successfully`)
                onClose()
            } else {
                toast.error('Failed to update schedules')
            }
        } catch (error) {
            console.error('Error saving schedule:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to save schedule')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'scheduled': return 'bg-blue-100 text-blue-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = addMonths(new Date(), i)
        return {
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
        }
    })

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[96%] md:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Group Visit Schedule
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Schedule Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Monthly Visit Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {schedules.map((schedule, index) => (
                                    <Card key={`${schedule.groupId}-${schedule.month}-${schedule.scheduledDate || index}`} className="p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-sm">{schedule.groupName}</h4>
                                                <Badge className={getStatusColor(schedule.status)}>
                                                    {schedule.status}
                                                </Badge>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(schedule.month), 'MMMM yyyy')}
                                            </div>

                                            {schedule.scheduledDate ? (
                                                <div className="text-sm font-medium text-blue-600">
                                                    {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    Not scheduled
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Schedule Group Visits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingData ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                groups.map((group) => {
                                    const groupSchedules = schedules.filter(s => s.groupId === group._id)
                                    return (
                                        <Card key={group._id} className="p-4">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{group.name}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {groupSchedules.filter(s => s.status === 'completed').length} completed, {groupSchedules.filter(s => s.status === 'scheduled').length} scheduled
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {groupSchedules.slice(0, 6).map((schedule, scheduleIndex) => (
                                                        <div key={`${schedule.groupId}-${schedule.month}-${schedule.scheduledDate || scheduleIndex}`} className="flex items-center justify-between p-2 border rounded">
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium">{schedule.monthLabel}</div>
                                                                <Badge className={getStatusColor(schedule.status)} size="sm">
                                                                    {schedule.status}
                                                                </Badge>
                                                            </div>
                                                            <Input
                                                                type="date"
                                                                value={schedule.scheduledDate}
                                                                onChange={(e) => handleScheduleUpdate(schedule.groupId, schedule.month, e.target.value)}
                                                                className="w-32 h-8 text-xs"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Visit Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {schedules.filter(s => s.status === 'completed').length}
                                    </div>
                                    <div className="text-sm text-green-700">Completed</div>
                                </div>

                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {schedules.filter(s => s.status === 'scheduled').length}
                                    </div>
                                    <div className="text-sm text-blue-700">Scheduled</div>
                                </div>

                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {schedules.filter(s => s.status === 'pending').length}
                                    </div>
                                    <div className="text-sm text-yellow-700">Pending</div>
                                </div>

                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {groups.length}
                                    </div>
                                    <div className="text-sm text-purple-700">Total Groups</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add New Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Add New Visit Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <NewScheduleForm onScheduleAdd={(newSchedule) => {
                                setSchedules(prev => [...prev, newSchedule])
                            }} groups={groups} />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSchedule} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Schedule'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Component for adding new schedules
function NewScheduleForm({ onScheduleAdd, groups }: { onScheduleAdd: (schedule: ScheduleItem) => void, groups: Group[] }) {
    const [selectedGroup, setSelectedGroup] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedDate, setSelectedDate] = useState('')

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const date = addMonths(new Date(), i)
        return {
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy')
        }
    })

    const handleAdd = () => {
        if (!selectedGroup || !selectedMonth || !selectedDate) {
            toast.error('Please fill all fields')
            return
        }

        const group = groups.find(g => g._id === selectedGroup)
        if (!group) {
            toast.error('Group not found')
            return
        }

        const newSchedule: ScheduleItem = {
            groupId: selectedGroup,
            groupName: group.name,
            month: selectedMonth,
            monthLabel: format(new Date(selectedMonth + '-01'), 'MMMM yyyy'),
            scheduledDate: selectedDate,
            status: 'scheduled'
        }

        console.log('Adding new schedule:', newSchedule) // Debug log
        onScheduleAdd(newSchedule)

        // Reset only group and date, keep month for easier multiple entries
        setSelectedGroup('')
        setSelectedDate('')
        // Don't reset month to allow multiple groups for same month

        toast.success(`Schedule added for ${group.name} - ${format(new Date(selectedDate), 'MMM dd')}`)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <Label>Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                        {groups.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                                {group.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Visit Date</Label>
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <Button onClick={handleAdd}>
                Add Schedule
            </Button>
        </div>
    )
}