"use server"

import { User, withAuth } from "../helpers/auth"
import { Event, Announcement } from "../models/event.models"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"

async function _createEvent(user: User, data: {
    title: string
    description?: string
    type: 'meeting' | 'assembly' | 'convention' | 'memorial' | 'co-visit' | 'special-talk' | 'other'
    startDate: Date
    endDate?: Date
    location?: string
    maxAttendees?: number
    registrationRequired?: boolean
    registrationDeadline?: Date
}) {
    try {
        await connectToDB()
        
        const event = new Event({
            ...data,
            organizer: user._id,
            status: 'published'
        })
        await event.save()

        await logActivity({
            userId: user._id as string,
            type: 'event_create',
            action: `${user.fullName} created event: ${data.title}`,
            details: { entityId: event._id, entityType: 'Event' }
        })

        revalidatePath('/dashboard/events')
        revalidatePath('/dashboard/calendar')
        return JSON.parse(JSON.stringify(event))
    } catch (error) {
        console.error('Error creating event:', error)
        throw error
    }
}

async function _fetchEvents(user: User, filters?: {
    type?: string
    startDate?: Date
    endDate?: Date
}) {
    try {
        await connectToDB()
        
        let query: any = { status: { $ne: 'cancelled' } }
        
        if (filters?.type) {
            query.type = filters.type
        }
        
        if (filters?.startDate && filters?.endDate) {
            query.startDate = { 
                $gte: filters.startDate, 
                $lte: filters.endDate 
            }
        }

        const events = await Event.find(query)
            .populate('organizer', 'fullName')
            .sort({ startDate: 1 })

        return JSON.parse(JSON.stringify(events))
    } catch (error) {
        console.error('Error fetching events:', error)
        throw error
    }
}

async function _updateEvent(user: User, eventId: string, data: {
    title?: string
    description?: string
    startDate?: Date
    endDate?: Date
    location?: string
    status?: 'draft' | 'published' | 'cancelled' | 'completed'
}) {
    try {
        await connectToDB()
        
        const event = await Event.findByIdAndUpdate(
            eventId,
            data,
            { new: true, runValidators: false }
        )

        if (!event) throw new Error("Event not found")

        await logActivity({
            userId: user._id as string,
            type: 'event_update',
            action: `${user.fullName} updated event: ${event.title}`,
            details: { entityId: eventId, entityType: 'Event' }
        })

        revalidatePath('/dashboard/events')
        revalidatePath('/dashboard/calendar')
        return JSON.parse(JSON.stringify(event))
    } catch (error) {
        console.error('Error updating event:', error)
        throw error
    }
}

async function _deleteEvent(user: User, eventId: string) {
    try {
        await connectToDB()
        
        const event = await Event.findByIdAndUpdate(
            eventId,
            { status: 'cancelled' },
            { new: true }
        )

        if (!event) throw new Error("Event not found")

        await logActivity({
            userId: user._id as string,
            type: 'event_delete',
            action: `${user.fullName} cancelled event: ${event.title}`,
            details: { entityId: eventId, entityType: 'Event' }
        })

        revalidatePath('/dashboard/events')
        revalidatePath('/dashboard/calendar')
        return JSON.parse(JSON.stringify(event))
    } catch (error) {
        console.error('Error deleting event:', error)
        throw error
    }
}

async function _registerForEvent(user: User, eventId: string) {
    try {
        await connectToDB()
        
        const event = await Event.findById(eventId)
        if (!event) throw new Error("Event not found")

        if (event.attendees.includes(user._id)) {
            throw new Error("Already registered for this event")
        }

        if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
            throw new Error("Event is full")
        }

        event.attendees.push(user._id)
        await event.save()

        await logActivity({
            userId: user._id as string,
            type: 'event_register',
            action: `${user.fullName} registered for event: ${event.title}`,
            details: { entityId: eventId, entityType: 'Event' }
        })

        revalidatePath('/dashboard/events')
        return JSON.parse(JSON.stringify(event))
    } catch (error) {
        console.error('Error registering for event:', error)
        throw error
    }
}

async function _getCalendarEvents(user: User, month: number, year: number) {
    try {
        await connectToDB()
        
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)

        const events = await Event.find({
            status: { $ne: 'cancelled' },
            startDate: { $gte: startDate, $lte: endDate }
        })
        .populate('organizer', 'fullName')
        .sort({ startDate: 1 })

        return JSON.parse(JSON.stringify(events))
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        throw error
    }
}

export const createEvent = await withAuth(_createEvent)
export const fetchEvents = await withAuth(_fetchEvents)
export const updateEvent = await withAuth(_updateEvent)
export const deleteEvent = await withAuth(_deleteEvent)
export const registerForEvent = await withAuth(_registerForEvent)
export const getCalendarEvents = await withAuth(_getCalendarEvents)