"use server"

import { User, withAuth } from "../helpers/auth"
import { Message, Broadcast } from "../models/communication.models"
import { Announcement } from "../models/event.models"
import { NotificationService } from "../services/notification.service"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"
import Member from "../models/user.models"
import Role from "../models/role.models"
import Privilege from "../models/privilege.models"

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
        type: 'all' | 'group' | 'role' | 'privilege'
        groups?: string[]
        roles?: string[]
        privileges?: string[]
    }
    scheduledFor?: Date
    deliveryMethod: ('email' | 'sms' | 'push' | 'in-app')[]
}) {
    try {
        await connectToDB()
        
        // Get target recipients
        let recipients = []
        
        if (data.targetAudience.type === 'all') {
            const allMembers = await Member.find({ status: 'active' }).select('_id email')
            recipients = allMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'role') {
            const roleMembers = await Member.find({
                status: 'active',
                role: { $in: data.targetAudience.roles }
            }).select('_id email')
            recipients = roleMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'group') {
            const groupMembers = await Member.find({
                status: 'active',
                groupId: { $in: data.targetAudience.groups }
            }).select('_id email')
            recipients = groupMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'privilege') {
            const privilegeMembers = await Member.find({
                status: 'active',
                'privileges.name': { $in: data.targetAudience.privileges }
            }).select('_id email')
            recipients = privilegeMembers.map(m => m._id)
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
            await _deliverBroadcast(broadcast._id.toString(), data.deliveryMethod)
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
                role: { $in: data.targetAudience.roles }
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

async function _markMessageAsRead(user: User, messageId: string) {
    try {
        await connectToDB()
        
        const message = await Message.findById(messageId)
        if (!message) {
            throw new Error('Message not found')
        }

        // Check if user is recipient
        const isRecipient = message.to.some((id: any) => id.toString() === user._id.toString())
        if (!isRecipient) {
            throw new Error('Unauthorized to mark this message as read')
        }

        // Check if already marked as read
        const alreadyRead = message.readBy.some((read: any) => read.userId.toString() === user._id.toString())
        if (alreadyRead) {
            return { success: true, message: 'Already marked as read' }
        }

        // Add to readBy array
        message.readBy.push({
            userId: user._id,
            readAt: new Date()
        })
        await message.save()

        await logActivity({
            userId: user._id as string,
            type: 'message_read',
            action: `${user.fullName} marked a message as read`,
            details: { entityId: messageId, entityType: 'Message' }
        })

        revalidatePath('/dashboard/communication')
        return { success: true }
    } catch (error) {
        console.error('Error marking message as read:', error)
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

async function _deliverBroadcast(broadcastId: string, deliveryMethods: string[]) {
    try {
        const broadcast = await Broadcast.findById(broadcastId).populate('sender', 'fullName email')
        if (!broadcast) throw new Error('Broadcast not found')

        const recipients = await Member.find({ 
            _id: { $in: broadcast.recipients },
            status: 'active' 
        }).select('_id fullName email')

        // In-app notifications
        if (deliveryMethods.includes('in-app')) {
            await NotificationService.sendBulkNotifications(
                recipients.map(r => r._id.toString()),
                {
                    type: 'announcement',
                    title: broadcast.title,
                    message: broadcast.content,
                    priority: 'medium',
                    metadata: { broadcastId }
                }
            )
        }

        // Email notifications
        if (deliveryMethods.includes('email')) {
            const nodemailer = require('nodemailer')
            const transporter = nodemailer.createTransporter({
                // Configure with your email settings
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })

            for (const recipient of recipients) {
                if (recipient.email) {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: recipient.email,
                        subject: broadcast.title,
                        html: `
                            <h2>${broadcast.title}</h2>
                            <p>${broadcast.content}</p>
                            <hr>
                            <p><small>Sent by ${broadcast.sender.fullName}</small></p>
                        `
                    })
                }
            }
        }

        // Push notifications
        if (deliveryMethods.includes('push')) {
            const PushSubscription = (await import('../models/push-subscription.models')).default
            const webpush = require('web-push')
            
            // Configure web-push
            webpush.setVapidDetails(
                'mailto:admin@suame.org',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN4EMgAINkDOovHK_Ae2zgCkMLwTKnjSQx4IFgXqJFuwGcqojpXK_11',
                process.env.VAPID_PRIVATE_KEY || 'tUxbf-Ww-8Q1Q9QFfk3P38S_wIiT6L3RBrSKckrdjbE'
            )

            // Get active push subscriptions for recipients
            const subscriptions = await PushSubscription.find({
                userId: { $in: recipients.map(r => r._id) },
                isActive: true
            })

            const pushPayload = {
                title: broadcast.title,
                body: broadcast.content,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                data: { broadcastId, type: 'broadcast' },
                actions: [
                    { action: 'view', title: 'View', icon: '/icon-192x192.png' },
                    { action: 'close', title: 'Close', icon: '/icon-192x192.png' }
                ]
            }

            for (const subscription of subscriptions) {
                try {
                    const pushSubscription = {
                        endpoint: subscription.endpoint,
                        keys: {
                            p256dh: subscription.keys.p256dh,
                            auth: subscription.keys.auth
                        }
                    }

                    await webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify(pushPayload)
                    )

                    // Update last used timestamp
                    subscription.lastUsed = new Date()
                    await subscription.save()
                } catch (error) {
                    console.error('Push notification error:', error)
                    
                    // Handle expired subscriptions
                    if (error.statusCode === 410) {
                        subscription.isActive = false
                        await subscription.save()
                    }
                }
            }
        }

        // SMS notifications
        if (deliveryMethods.includes('sms')) {
            // TODO: Implement SMS notifications
            console.log('SMS notifications - TODO: Implement SMS service')
        }

    } catch (error) {
        console.error('Error delivering broadcast:', error)
        throw error
    }
}

async function _updateBroadcast(user: User, broadcastId: string, data: {
    title: string
    content: string
    targetAudience: {
        type: 'all' | 'group' | 'role' | 'privilege'
        groups?: string[]
        roles?: string[]
        privileges?: string[]
    }
    scheduledFor?: Date
    deliveryMethod: ('email' | 'sms' | 'push' | 'in-app')[]
}) {
    try {
        await connectToDB()
        
        const broadcast = await Broadcast.findById(broadcastId)
        if (!broadcast) {
            throw new Error('Broadcast not found')
        }

        // Check if user is sender
        if (broadcast.sender.toString() !== user._id.toString()) {
            throw new Error('Unauthorized to edit this broadcast')
        }

        // Can only edit drafts or scheduled broadcasts
        if (broadcast.status === 'sent') {
            throw new Error('Cannot edit sent broadcasts')
        }

        // Get target recipients
        let recipients = []
        
        if (data.targetAudience.type === 'all') {
            const allMembers = await Member.find({ status: 'active' }).select('_id email')
            recipients = allMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'role') {
            const roleMembers = await Member.find({
                status: 'active',
                role: { $in: data.targetAudience.roles }
            }).select('_id email')
            recipients = roleMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'group') {
            const groupMembers = await Member.find({
                status: 'active',
                groupId: { $in: data.targetAudience.groups }
            }).select('_id email')
            recipients = groupMembers.map(m => m._id)
        } else if (data.targetAudience.type === 'privilege') {
            const privilegeMembers = await Member.find({
                status: 'active',
                'privileges.name': { $in: data.targetAudience.privileges }
            }).select('_id email')
            recipients = privilegeMembers.map(m => m._id)
        }

        const updatedBroadcast = await Broadcast.findByIdAndUpdate(
            broadcastId,
            {
                ...data,
                recipients,
                status: data.scheduledFor ? 'scheduled' : 'draft'
            },
            { new: true }
        ).populate('sender', 'fullName')

        await logActivity({
            userId: user._id as string,
            type: 'broadcast_update',
            action: `${user.fullName} updated broadcast: ${data.title}`,
            details: { entityId: broadcastId, entityType: 'Broadcast' }
        })

        revalidatePath('/dashboard/communication')
        return JSON.parse(JSON.stringify(updatedBroadcast))
    } catch (error) {
        console.error('Error updating broadcast:', error)
        throw error
    }
}

async function _deleteBroadcast(user: User, broadcastId: string) {
    try {
        await connectToDB()
        
        const broadcast = await Broadcast.findById(broadcastId)
        if (!broadcast) {
            throw new Error('Broadcast not found')
        }

        // Check if user is sender
        if (broadcast.sender.toString() !== user._id.toString()) {
            throw new Error('Unauthorized to delete this broadcast')
        }

        await Broadcast.findByIdAndDelete(broadcastId)

        await logActivity({
            userId: user._id as string,
            type: 'broadcast_delete',
            action: `${user.fullName} deleted broadcast: ${broadcast.title}`,
            details: { entityId: broadcastId, entityType: 'Broadcast' }
        })

        revalidatePath('/dashboard/communication')
        return { success: true }
    } catch (error) {
        console.error('Error deleting broadcast:', error)
        throw error
    }
}

async function _getRolesAndPrivileges(user: User) {
    try {
        await connectToDB()
        
        const [roles, privileges] = await Promise.all([
            Role.find({}).select('name').lean(),
            Privilege.find({}).select('name').lean()
        ])
        
        return {
            roles: roles.map(r => r.name),
            privileges: privileges.map(p => p.name)
        }
    } catch (error) {
        console.error('Error fetching roles and privileges:', error)
        throw error
    }
}

export const sendMessage = await withAuth(_sendMessage)
export const createBroadcast = await withAuth(_createBroadcast)
export const updateBroadcast = await withAuth(_updateBroadcast)
export const deleteBroadcast = await withAuth(_deleteBroadcast)
export const createAnnouncement = await withAuth(_createAnnouncement)
export const fetchMessages = await withAuth(_fetchMessages)
export const fetchAnnouncements = await withAuth(_fetchAnnouncements)
export const fetchBroadcasts = await withAuth(_fetchBroadcasts)
export const markMessageAsRead = await withAuth(_markMessageAsRead)
export const deleteMessage = await withAuth(_deleteMessage)
export const getRolesAndPrivileges = await withAuth(_getRolesAndPrivileges)