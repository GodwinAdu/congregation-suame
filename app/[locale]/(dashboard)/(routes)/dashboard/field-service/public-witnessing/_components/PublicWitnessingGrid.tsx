"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchPublicWitnessing, deletePublicWitnessing } from '@/lib/actions/public-witnessing.actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import PublicWitnessingModal from './PublicWitnessingModal'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns'

interface PublicWitnessingSchedule {
    _id: string
    location: string
    date: string
    startTime: string
    endTime: string
    participants: Array<{
        memberId: string
        memberName: string
        role: string
    }>
    status: string
    notes?: string
}

const PublicWitnessingGrid = () => {
    const [schedules, setSchedules] = useState<PublicWitnessingSchedule[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSchedule, setEditingSchedule] = useState<PublicWitnessingSchedule | null>(null)
    const [currentWeek, setCurrentWeek] = useState(new Date())

    const fetchSchedules = async () => {
        try {
            const data = await fetchPublicWitnessing()
            setSchedules(data)
        } catch (error) {
            console.error('Error fetching schedules:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedules()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleEdit = (schedule: PublicWitnessingSchedule) => {
        setEditingSchedule(schedule)
        setShowModal(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return
        
        try {
            await deletePublicWitnessing(id)
            toast.success('Schedule deleted successfully')
            fetchSchedules()
        } catch (error) {
            toast.error('Failed to delete schedule')
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setEditingSchedule(null)
    }

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    const getSchedulesForDay = (day: Date) => {
        return schedules.filter(schedule => isSameDay(new Date(schedule.date), day))
    }

    if (loading) {
        return <div className="text-center py-8">Loading schedules...</div>
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-xl lg:text-2xl font-bold">Public Witnessing Schedule</h2>
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="sm:inline">Schedule Witnessing</span>
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
                    const daySchedules = getSchedulesForDay(day)
                    return (
                        <Card key={day.toISOString()} className="overflow-hidden">
                            <CardHeader className="bg-primary text-white p-3">
                                <CardTitle className="text-sm font-medium">
                                    {dayNames[index]}, {format(day, 'MMM dd')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-2">
                                {daySchedules.map((schedule) => (
                                    <div key={schedule._id} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-medium">{schedule.location}</div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(schedule.status)}>
                                                    {schedule.status}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(schedule._id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {schedule.startTime} - {schedule.endTime}
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {schedule.participants.length} participants
                                        </div>
                                        {schedule.participants.length > 0 && (
                                            <div className="space-y-1 mb-2">
                                                {schedule.participants.map((participant, index) => (
                                                    <div key={index} className="flex justify-between text-xs">
                                                        <span>{participant.memberName}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {participant.role}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {schedule.notes && (
                                            <div className="text-sm text-muted-foreground bg-white p-2 rounded">
                                                {schedule.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {daySchedules.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        No witnessing scheduled
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
                        const daySchedules = getSchedulesForDay(day)
                        return (
                            <div key={day.toISOString()} className="space-y-2">
                                <div className="text-center p-2 bg-primary text-white rounded-t-lg">
                                    <div className="font-semibold text-xs lg:text-sm">{dayNames[index].slice(0, 3)}</div>
                                    <div className="text-xs">{format(day, 'dd')}</div>
                                </div>
                                <div className="min-h-[150px] lg:min-h-[200px] bg-gray-50 rounded-b-lg p-1 lg:p-2 space-y-1 lg:space-y-2">
                                    {daySchedules.map((schedule) => (
                                        <Card key={schedule._id} className="p-1 lg:p-2 hover:shadow-sm transition-shadow">
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-xs font-medium truncate pr-1">{schedule.location}</div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-5 w-5 lg:h-6 lg:w-6 p-0">
                                                                <MoreVertical className="w-3 h-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                                                <Edit className="w-3 h-3 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(schedule._id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <Badge className={getStatusColor(schedule.status)} size="sm" className="text-xs">
                                                    {schedule.status}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {schedule.participants.length} participants
                                                </div>
                                                {schedule.participants.length > 0 && (
                                                    <div className="space-y-1">
                                                        {schedule.participants.slice(0, 2).map((participant, index) => (
                                                            <div key={index} className="text-xs text-muted-foreground truncate">
                                                                {participant.memberName} ({participant.role})
                                                            </div>
                                                        ))}
                                                        {schedule.participants.length > 2 && (
                                                            <div className="text-xs text-muted-foreground">
                                                                +{schedule.participants.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {schedule.notes && (
                                                    <div className="text-xs text-muted-foreground bg-white p-1 rounded break-words">
                                                        {schedule.notes.length > 30 ? `${schedule.notes.slice(0, 30)}...` : schedule.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                    {daySchedules.length === 0 && (
                                        <div className="text-center text-xs text-muted-foreground py-4 lg:py-8">
                                            No witnessing
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <PublicWitnessingModal 
                open={showModal} 
                onClose={handleModalClose}
                onSuccess={fetchSchedules}
                schedule={editingSchedule || undefined}
            />
        </div>
    )
}

export default PublicWitnessingGrid