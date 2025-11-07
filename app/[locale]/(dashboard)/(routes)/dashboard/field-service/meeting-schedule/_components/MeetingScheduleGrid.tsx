"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchFieldServiceMeetings, deleteFieldServiceMeeting } from '@/lib/actions/field-service-meeting.actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import MeetingScheduleModal from './MeetingScheduleModal'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { toast } from 'sonner'

interface Meeting {
    _id: string
    date: string
    startTime: string
    endTime: string
    location: string
    conductor: {
        memberId: string
        memberName: string
    }
    information?: string
}

const MeetingScheduleGrid = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
    const [currentWeek, setCurrentWeek] = useState(new Date())

    const fetchMeetings = async () => {
        try {
            const data = await fetchFieldServiceMeetings()
            setMeetings(data)
        } catch (error) {
            console.error('Error fetching meetings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeetings()
    }, [])

    const handleEdit = (meeting: Meeting) => {
        setEditingMeeting(meeting)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this meeting?')) return
        
        try {
            await deleteFieldServiceMeeting(id)
            toast.success('Meeting deleted successfully')
            fetchMeetings()
        } catch (error) {
            toast.error('Failed to delete meeting')
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setEditingMeeting(null)
    }

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const getMeetingsForDay = (day: Date) => {
        return meetings.filter(meeting => isSameDay(new Date(meeting.date), day))
    }

    if (loading) {
        return <div className="text-center py-8">Loading meetings...</div>
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-bold">Field Service Meeting Schedule</h2>
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="sm:inline">Schedule Meeting</span>
                </Button>
            </div>

            <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-lg border">
                <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-sm lg:text-lg font-semibold text-center">
                    <span className="hidden sm:inline">{format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}</span>
                    <span className="sm:hidden">{format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd')}</span>
                </h3>
                <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
                {weekDays.map((day, index) => {
                    const dayMeetings = getMeetingsForDay(day)
                    return (
                        <Card key={day.toISOString()} className="overflow-hidden">
                            <CardHeader className="bg-primary text-white p-3">
                                <CardTitle className="text-sm font-medium">
                                    {dayNames[index]}, {format(day, 'MMM dd')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                {dayMeetings.map((meeting) => (
                                    <div key={meeting._id} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-medium">{meeting.location}</div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(meeting._id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {meeting.startTime} - {meeting.endTime}
                                        </div>
                                        {meeting.conductor?.memberName && (
                                            <div className="text-sm text-muted-foreground mb-1">
                                                <User className="w-4 h-4 inline mr-1" />
                                                {meeting.conductor.memberName}
                                            </div>
                                        )}
                                        {meeting.information && (
                                            <div className="text-sm text-muted-foreground bg-white p-2 rounded">
                                                {meeting.information}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {dayMeetings.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        No meetings scheduled
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-7 gap-2 lg:gap-4">
                    {weekDays.map((day, index) => {
                        const dayMeetings = getMeetingsForDay(day)
                        return (
                            <div key={day.toISOString()} className="space-y-2">
                                <div className="text-center p-2 bg-primary text-white rounded-t-lg">
                                    <div className="font-semibold text-xs lg:text-sm">{dayNames[index].slice(0, 3)}</div>
                                    <div className="text-xs">{format(day, 'dd')}</div>
                                </div>
                                <div className="min-h-[150px] lg:min-h-[200px] bg-gray-50 rounded-b-lg p-1 lg:p-2 space-y-1 lg:space-y-2">
                                    {dayMeetings.map((meeting) => (
                                        <Card key={meeting._id} className="p-1 lg:p-2 hover:shadow-sm transition-shadow">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-xs font-medium truncate pr-1">{meeting.location}</div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-5 w-5 lg:h-6 lg:w-6 p-0">
                                                                <MoreVertical className="w-3 h-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(meeting)}>
                                                                <Edit className="w-3 h-3 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(meeting._id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {meeting.startTime} - {meeting.endTime}
                                                </div>
                                                {meeting.conductor?.memberName && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {meeting.conductor.memberName}
                                                    </div>
                                                )}
                                                {meeting.information && (
                                                    <div className="text-xs text-muted-foreground bg-white p-1 rounded break-words">
                                                        {meeting.information.length > 30 ? `${meeting.information.slice(0, 30)}...` : meeting.information}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                    {dayMeetings.length === 0 && (
                                        <div className="text-center text-xs text-muted-foreground py-4 lg:py-8">
                                            No meetings
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <MeetingScheduleModal 
                open={showModal} 
                onClose={handleModalClose}
                onSuccess={fetchMeetings}
                meeting={editingMeeting || undefined}
            />
        </div>
    )
}


export default MeetingScheduleGrid