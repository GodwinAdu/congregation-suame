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
    const [newSchedules, setNewSchedules] = useState<ScheduleItem[]>([])
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
            // Only save new schedules created in this session
            const scheduleData = newSchedules
                .filter(schedule => schedule.scheduledDate && schedule.scheduledDate.trim() !== '')
                .map(schedule => ({
                    groupId: schedule.groupId,
                    month: schedule.month,
                    scheduledDate: schedule.scheduledDate,
                    status: schedule.status as 'scheduled' | 'completed' | 'pending'
                }))

            console.log('Saving new schedules:', scheduleData)

            if (scheduleData.length === 0) {
                toast.error('Please add at least one new visit schedule')
                return
            }

            const result = await updateGroupSchedule(scheduleData)

            if (result.success) {
                toast.success(`${scheduleData.length} new group schedule(s) saved successfully`)
                setNewSchedules([]) // Clear new schedules after saving
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
                    {/* New Schedules Overview */}
                    {newSchedules.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    New Schedules to Save
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {newSchedules.map((schedule, index) => (
                                        <Card key={`new-${schedule.groupId}-${schedule.month}-${index}`} className="p-4 border-blue-200 bg-blue-50">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-sm">{schedule.groupName}</h4>
                                                    <Badge className="bg-blue-600 text-white">
                                                        New
                                                    </Badge>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    {format(new Date(schedule.month), 'MMMM yyyy')}
                                                </div>

                                                <div className="text-sm font-medium text-blue-600">
                                                    {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}







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
                                setNewSchedules(prev => [...prev, newSchedule])
                            }} groups={groups} />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSchedule} disabled={loading || newSchedules.length === 0}>
                            {loading ? 'Saving...' : `Save ${newSchedules.length} New Schedule${newSchedules.length !== 1 ? 's' : ''}`}
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
                    min={selectedMonth ? `${selectedMonth}-01` : undefined}
                    max={selectedMonth ? `${selectedMonth}-${new Date(new Date(selectedMonth + '-01').getFullYear(), new Date(selectedMonth + '-01').getMonth() + 1, 0).getDate().toString().padStart(2, '0')}` : undefined}
                />
            </div>

            <Button onClick={handleAdd}>
                Add Schedule
            </Button>
        </div>
    )
}