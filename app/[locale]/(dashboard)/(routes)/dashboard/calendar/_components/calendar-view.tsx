"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users, Clock } from "lucide-react"
import { getCalendarEvents } from "@/lib/actions/event.actions"

interface Event {
    _id: string
    title: string
    type: string
    startDate: string
    endDate?: string
    location?: string
    organizer: { fullName: string }
    attendees: string[]
}

interface CalendarViewProps {
    initialEvents: Event[]
}

export function CalendarView({ initialEvents }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [events, setEvents] = useState<Event[]>(initialEvents)
    const [isLoading, setIsLoading] = useState(false)

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

    const navigateMonth = async (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setMonth(currentDate.getMonth() - 1)
        } else {
            newDate.setMonth(currentDate.getMonth() + 1)
        }
        
        setCurrentDate(newDate)
        setIsLoading(true)
        
        try {
            const newEvents = await getCalendarEvents(newDate.getMonth() + 1, newDate.getFullYear())
            setEvents(newEvents)
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.startDate)
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear()
        })
    }

    const getEventTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'meeting': 'bg-blue-500',
            'assembly': 'bg-green-500',
            'convention': 'bg-purple-500',
            'memorial': 'bg-red-500',
            'co-visit': 'bg-orange-500',
            'special-talk': 'bg-yellow-500',
            'other': 'bg-gray-500'
        }
        return colors[type] || 'bg-gray-500'
    }

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigateMonth('prev')}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigateMonth('next')}
                                disabled={isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                        
                        {/* Empty cells for days before month starts */}
                        {emptyDays.map(day => (
                            <div key={`empty-${day}`} className="p-2 h-24"></div>
                        ))}
                        
                        {/* Calendar Days */}
                        {days.map(day => {
                            const dayEvents = getEventsForDay(day)
                            const isToday = new Date().getDate() === day && 
                                          new Date().getMonth() === currentDate.getMonth() && 
                                          new Date().getFullYear() === currentDate.getFullYear()
                            
                            return (
                                <div 
                                    key={day} 
                                    className={`p-2 h-24 border rounded-lg ${
                                        isToday ? 'bg-primary/10 border-primary' : 'border-border'
                                    }`}
                                >
                                    <div className="font-medium text-sm mb-1">{day}</div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 2).map(event => (
                                            <div 
                                                key={event._id}
                                                className={`text-xs p-1 rounded text-white truncate ${
                                                    getEventTypeColor(event.type)
                                                }`}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div className="text-xs text-muted-foreground">
                                                +{dayEvents.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Events This Month</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No events this month</h3>
                            <p className="text-muted-foreground">No events scheduled for this month</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div key={event._id} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <div className="flex-shrink-0">
                                        <Badge className={`${getEventTypeColor(event.type)} text-white`}>
                                            {event.type.replace('-', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-semibold">{event.title}</h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {new Date(event.startDate).toLocaleDateString()}
                                                {event.endDate && (
                                                    <span> - {new Date(event.endDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {event.attendees.length} attendees
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Organized by {event.organizer.fullName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}