"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, MapPin, Users, Clock, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteEvent, registerForEvent } from "@/lib/actions/event.actions"
import { CreateEventModal } from "./create-event-modal"

interface Event {
    _id: string
    title: string
    description?: string
    type: string
    startDate: string
    endDate?: string
    location?: string
    organizer: { _id: string; fullName: string }
    attendees: string[]
    maxAttendees?: number
    registrationRequired: boolean
    status: string
}

interface EventManagerProps {
    events: Event[]
}

export function EventManager({ events: initialEvents }: EventManagerProps) {
    const [events, setEvents] = useState<Event[]>(initialEvents)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [filterType, setFilterType] = useState<string>("all")

    const handleDeleteEvent = async (eventId: string) => {
        try {
            await deleteEvent(eventId)
            setEvents(prev => prev.filter(e => e._id !== eventId))
            toast.success("Event cancelled successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to cancel event")
        }
    }

    const handleRegister = async (eventId: string) => {
        try {
            const updatedEvent = await registerForEvent(eventId)
            setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e))
            toast.success("Registered for event successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to register")
        }
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

    const filteredEvents = events.filter(event => {
        if (filterType === "all") return true
        return event.type === filterType
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Events</h2>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="meeting">Meetings</SelectItem>
                            <SelectItem value="assembly">Assemblies</SelectItem>
                            <SelectItem value="convention">Conventions</SelectItem>
                            <SelectItem value="memorial">Memorial</SelectItem>
                            <SelectItem value="co-visit">CO Visits</SelectItem>
                            <SelectItem value="special-talk">Special Talks</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                </Button>
            </div>

            {filteredEvents.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                        <p className="text-muted-foreground">
                            {filterType === "all" ? "Create your first event" : `No ${filterType} events found`}
                        </p>
                        {filterType === "all" && (
                            <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
                                <Plus className="h-4 w-4" />
                                Create Event
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <Card key={event._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{event.title}</CardTitle>
                                        <Badge className={`${getEventTypeColor(event.type)} text-white text-xs`}>
                                            {event.type.replace('-', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDeleteEvent(event._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                {event.description && (
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                )}
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                        {event.endDate && (
                                            <span>- {new Date(event.endDate).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    
                                    {event.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{event.location}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {event.attendees.length} attendees
                                            {event.maxAttendees && ` / ${event.maxAttendees} max`}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs text-muted-foreground">
                                        Organized by {event.organizer.fullName}
                                    </div>
                                </div>
                                
                                {event.registrationRequired && (
                                    <Button 
                                        onClick={() => handleRegister(event._id)}
                                        className="w-full"
                                        size="sm"
                                    >
                                        Register
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateEventModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={(newEvent) => {
                    setEvents(prev => [...prev, newEvent])
                    setShowCreateModal(false)
                }}
            />
        </div>
    )
}