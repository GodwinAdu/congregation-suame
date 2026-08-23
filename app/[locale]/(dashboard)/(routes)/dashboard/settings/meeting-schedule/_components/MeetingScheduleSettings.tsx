"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getMeetingSchedules, updateMeetingSchedule } from '@/lib/actions/meeting-schedule.actions'

interface Schedule {
    meetingType: 'Midweek' | 'Weekend'
    day: string
    startTime: string
    endTime: string
    gracePeriodMinutes: number
}

const DAYS = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
]

export function MeetingScheduleSettings() {
    const [midweek, setMidweek] = useState<Schedule>({
        meetingType: 'Midweek',
        day: 'thursday',
        startTime: '18:00',
        endTime: '20:00',
        gracePeriodMinutes: 10
    })
    const [weekend, setWeekend] = useState<Schedule>({
        meetingType: 'Weekend',
        day: 'sunday',
        startTime: '08:30',
        endTime: '10:30',
        gracePeriodMinutes: 10
    })
    const [loading, setLoading] = useState(true)
    const [savingMidweek, setSavingMidweek] = useState(false)
    const [savingWeekend, setSavingWeekend] = useState(false)

    useEffect(() => {
        const loadSchedules = async () => {
            try {
                const schedules = await getMeetingSchedules()
                const midweekSchedule = schedules.find((s: any) => s.meetingType === 'Midweek')
                const weekendSchedule = schedules.find((s: any) => s.meetingType === 'Weekend')

                if (midweekSchedule) {
                    setMidweek({
                        meetingType: 'Midweek',
                        day: midweekSchedule.day,
                        startTime: midweekSchedule.startTime,
                        endTime: midweekSchedule.endTime,
                        gracePeriodMinutes: midweekSchedule.gracePeriodMinutes
                    })
                }
                if (weekendSchedule) {
                    setWeekend({
                        meetingType: 'Weekend',
                        day: weekendSchedule.day,
                        startTime: weekendSchedule.startTime,
                        endTime: weekendSchedule.endTime,
                        gracePeriodMinutes: weekendSchedule.gracePeriodMinutes
                    })
                }
            } catch (error) {
                console.error('Error loading schedules:', error)
            } finally {
                setLoading(false)
            }
        }
        loadSchedules()
    }, [])

    const handleSaveMidweek = async () => {
        setSavingMidweek(true)
        try {
            await updateMeetingSchedule('Midweek', {
                day: midweek.day,
                startTime: midweek.startTime,
                endTime: midweek.endTime,
                gracePeriodMinutes: midweek.gracePeriodMinutes
            })
            toast.success('Midweek meeting schedule updated')
        } catch (error) {
            toast.error('Failed to update midweek schedule')
        } finally {
            setSavingMidweek(false)
        }
    }

    const handleSaveWeekend = async () => {
        setSavingWeekend(true)
        try {
            await updateMeetingSchedule('Weekend', {
                day: weekend.day,
                startTime: weekend.startTime,
                endTime: weekend.endTime,
                gracePeriodMinutes: weekend.gracePeriodMinutes
            })
            toast.success('Weekend meeting schedule updated')
        } catch (error) {
            toast.error('Failed to update weekend schedule')
        } finally {
            setSavingWeekend(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading schedule...</span>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Midweek Meeting */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Midweek Meeting
                    </CardTitle>
                    <CardDescription>Congregation Bible Study & Theocratic Ministry School</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Day of the Week</Label>
                        <Select value={midweek.day} onValueChange={(v) => setMidweek(prev => ({ ...prev, day: v }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map(d => (
                                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={midweek.startTime}
                                onChange={(e) => setMidweek(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={midweek.endTime}
                                onChange={(e) => setMidweek(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Grace Period (minutes)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={30}
                            value={midweek.gracePeriodMinutes}
                            onChange={(e) => setMidweek(prev => ({ ...prev, gracePeriodMinutes: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Members arriving after {midweek.startTime} + {midweek.gracePeriodMinutes} min will be marked as late
                        </p>
                    </div>
                    <Button onClick={handleSaveMidweek} disabled={savingMidweek} className="w-full">
                        {savingMidweek ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Midweek Schedule
                    </Button>
                </CardContent>
            </Card>

            {/* Weekend Meeting */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-500" />
                        Weekend Meeting
                    </CardTitle>
                    <CardDescription>Public Talk & Watchtower Study</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Day of the Week</Label>
                        <Select value={weekend.day} onValueChange={(v) => setWeekend(prev => ({ ...prev, day: v }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map(d => (
                                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={weekend.startTime}
                                onChange={(e) => setWeekend(prev => ({ ...prev, startTime: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={weekend.endTime}
                                onChange={(e) => setWeekend(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Grace Period (minutes)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={30}
                            value={weekend.gracePeriodMinutes}
                            onChange={(e) => setWeekend(prev => ({ ...prev, gracePeriodMinutes: parseInt(e.target.value) || 0 }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Members arriving after {weekend.startTime} + {weekend.gracePeriodMinutes} min will be marked as late
                        </p>
                    </div>
                    <Button onClick={handleSaveWeekend} disabled={savingWeekend} className="w-full">
                        {savingWeekend ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Weekend Schedule
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
