"use server"

import { User, withAuth } from "../helpers/auth"
import { Message, Broadcast } from "../models/communication.models"
import { Announcement } from "../models/event.models"
import { NotificationService } from "../services/notification.service"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"
import Member from "../models/user.models"

async function _sendMessage(user: User, data: {
    to: string[]
    subject: string
    content: string
    type: 'direct' | 'group' | 'broadcast'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    attachments?: string[]
    isEmergency?: boolean
}) {
    try {
        await connectToDB()
        
        const message = new Message({
            ...data,
            from: user._id
        })
        await message.save()

        // Send notifications to recipients
        for (const recipientId of data.to) {
            await NotificationService.sendNotification({
                userId: recipientId,
                type: data.isEmergency ? 'emergency' : 'announcement',
                title: data.subject,
                message: data.content,
                priority: data.priority,
                metadata: { messageId: message._id }
            })
        }

        await logActivity({
            userId: user._id as string,
            type: 'message_send',
            action: `${user.fullName} sent message: ${data.subject}`,
            details: { entityId: message._id, entityType: 'Message' }
        })

        revalidatePath('/dashboard/communication')
        return JSON.parse(JSON.stringify(message))
    } catch (error) {
        console.error('Error sending message:', error)
        throw error
    }
}

async function _createBroadcast(user: User, data: {
    title: string
    content: string
    targetAudience: {
        type: 'all' | 'group' | 'role'
        groups?: string[]
        roles?: string[]
    }
    scheduledFor?: Date
    deliveryMethod: ('email' | 'sms' | 'push' | 'in-app')[]
}) {
    try {
        await connectToDB()
        
        // Get target recipients
        let recipients = []
        
        if (data.targetAudience.type === 'all') {
            const allMembers = await Member.find({ status: 'active' }).select('_id')
            recipients = allMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'role') {
            const roleMembers = await Member.find({
                status: 'active',
                privileges: { $in: data.targetAudience.roles }
            }).select('_id')
            recipients = roleMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'group') {
            const groupMembers = await Member.find({
                status: 'active',
                groupId: { $in: data.targetAudience.groups }
            }).select('_id')
            recipients = groupMembers.map(m => m._id)
        }

        const broadcast = new Broadcast({
            ...data,
            sender: user._id,
            recipients,
            status: data.scheduledFor ? 'scheduled' : 'sent'
        })
        await broadcast.save()

        // Send immediately if not scheduled
        if (!data.scheduledFor) {
            await NotificationService.sendBulkNotifications(
                recipients.map(r => r.toString()),
                {
                    type: 'announcement',
                    title: data.title,
                    message: data.content,
                    priority: 'medium',
                    metadata: { broadcastId: broadcast._id }
                }
            )
        }

        await logActivity({
            userId: user._id as string,
            type: 'broadcast_create',
            action: `${user.fullName} created broadcast: ${data.title}`,
            details: { entityId: broadcast._id, entityType: 'Broadcast' }
        })

        revalidatePath('/dashboard/communication')
        return JSON.parse(JSON.stringify(broadcast))
    } catch (error) {
        console.error('Error creating broadcast:', error)
        throw error
    }
}

async function _createAnnouncement(user: User, data: {
    title: string
    content: string
    targetAudience: {
        type: 'all' | 'elders' | 'servants' | 'publishers' | 'group'
        groups?: string[]
        roles?: string[]
    }
    priority: 'low' | 'medium' | 'high' | 'urgent'
    expiresAt?: Date
}) {
    try {
        await connectToDB()
        
        const announcement = new Announcement({
            ...data,
            author: user._id,
            status: 'published'
        })
        await announcement.save()

        // Get target recipients for notifications
        let recipients = []
        
        if (data.targetAudience.type === 'all') {
            const allMembers = await Member.find({ status: 'active' }).select('_id')
            recipients = allMembers.map(m => m._id.toString())
        } else if (data.targetAudience.roles) {
            const roleMembers = await Member.find({
                status: 'active',
                privileges: { $in: data.targetAudience.roles }
            }).select('_id')
            recipients = roleMembers.map(m => m._id.toString())
        }

        // Send notifications
        await NotificationService.sendBulkNotifications(recipients, {
            type: 'announcement',
            title: data.title,
            message: data.content,
            priority: data.priority,
            metadata: { announcementId: announcement._id }
        })

        await logActivity({
            userId: user._id as string,
            type: 'announcement_create',
            action: `${user.fullName} created announcement: ${data.title}`,
            details: { entityId: announcement._id, entityType: 'Announcement' }
        })

        revalidatePath('/dashboard/communication')
        return JSON.parse(JSON.stringify(announcement))
    } catch (error) {
        console.error('Error creating announcement:', error)
        throw error
    }
}

async function _fetchMessages(user: User, type?: 'sent' | 'received') {
    try {
        await connectToDB()
        
        let query: any = {}
        
        if (type === 'sent') {
            query.from = user._id
        } else if (type === 'received') {
            query.to = user._id
        } else {
            query = {
                $or: [
                    { from: user._id },
                    { to: user._id }
                ]
            }
        }

        const messages = await Message.find(query)
            .populate('from', 'fullName')
            .populate('to', 'fullName')
            .sort({ createdAt: -1 })

        return JSON.parse(JSON.stringify(messages))
    } catch (error) {
        console.error('Error fetching messages:', error)
        throw error
    }
}

async function _fetchAnnouncements(user: User) {
    try {
        await connectToDB()
        
        const announcements = await Announcement.find({
            status: 'published',
            $or: [
                { 'targetAudience.type': 'all' },
                { 'targetAudience.roles': { $in: user.privileges || [] } },
                { 'targetAudience.groups': user.groupId }
            ],
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: { $gt: new Date() } }
            ]
        })
        .populate('author', 'fullName')
        .sort({ createdAt: -1 })

        return JSON.parse(JSON.stringify(announcements))
    } catch (error) {
        console.error('Error fetching announcements:', error)
        throw error
    }
}

async function _fetchBroadcasts(user: User) {
    try {
        await connectToDB()
        
        const broadcasts = await Broadcast.find({
            sender: user._id
        })
        .populate('sender', 'fullName')
        .sort({ createdAt: -1 })

        return JSON.parse(JSON.stringify(broadcasts))
    } catch (error) {
        console.error('Error fetching broadcasts:', error)
        throw error
    }
}

async function _deleteMessage(user: User, messageId: string) {
    try {
        await connectToDB()
        
        const message = await Message.findById(messageId)
        if (!message) {
            throw new Error('Message not found')
        }

        // Check if user is sender or recipient
        const isSender = message.from.toString() === user._id.toString()
        const isRecipient = message.to.some((id: any) => id.toString() === user._id.toString())
        
        if (!isSender && !isRecipient) {
            throw new Error('Unauthorized to delete this message')
        }

        await Message.findByIdAndDelete(messageId)

        await logActivity({
            userId: user._id as string,
            type: 'message_delete',
            action: `${user.fullName} deleted a message`,
            details: { entityId: messageId, entityType: 'Message' }
        })

        revalidatePath('/dashboard/communication')
        return { success: true }
    } catch (error) {
        console.error('Error deleting message:', error)
        throw error
    }
}

export const sendMessage = await withAuth(_sendMessage)
export const createBroadcast = await withAuth(_createBroadcast)
export const createAnnouncement = await withAuth(_createAnnouncement)
export const fetchMessages = await withAuth(_fetchMessages)
export const fetchAnnouncements = await withAuth(_fetchAnnouncements)
export const fetchBroadcasts = await withAuth(_fetchBroadcasts)
export const deleteMessage = await withAuth(_deleteMessage)