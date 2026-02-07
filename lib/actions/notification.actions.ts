"use server"

import { User, withAuth } from "../helpers/auth"
import { Notification, NotificationPreferences } from "../models/notification.models"
import { sendPushNotification } from "../services/notification.service"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import { logActivity } from "../utils/activity-logger"

async function _fetchNotifications(user: User, status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed') {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB()
        
        let query: any = { userId: user._id }
        if (status) {
            query.status = status
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50)

        return JSON.parse(JSON.stringify(notifications))
    } catch (error) {
        console.error('Error fetching notifications:', error)
        throw error
    }
}

async function _markNotificationAsRead(user: User, notificationId: string) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB()
        
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: user._id },
            { 
                status: 'read',
                readAt: new Date()
            },
            { new: true }
        )

        if (!notification) {
            throw new Error("Notification not found")
        }

        revalidatePath('/dashboard/notifications')
        return JSON.parse(JSON.stringify(notification))
    } catch (error) {
        console.error('Error marking notification as read:', error)
        throw error
    }
}

async function _updateNotificationPreferences(user: User, preferences: {
    assignments?: boolean
    meetings?: boolean
    fieldService?: boolean
    announcements?: boolean
    emergencies?: boolean
    method?: 'email' | 'sms' | 'push'
    quietHours?: {
        enabled: boolean
        start: string
        end: string
    }
}) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB()
        
        const updatedPreferences = await NotificationPreferences.findOneAndUpdate(
            { userId: user._id },
            preferences,
            { new: true, upsert: true }
        )

        await logActivity({
            userId: user._id as string,
            type: 'preferences_update',
            action: `${user.fullName} updated notification preferences`,
            details: { entityId: updatedPreferences._id, entityType: 'NotificationPreferences' }
        })

        revalidatePath('/dashboard/notifications')
        return JSON.parse(JSON.stringify(updatedPreferences))
    } catch (error) {
        console.error('Error updating notification preferences:', error)
        throw error
    }
}

async function _fetchNotificationPreferences(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB()
        
        let preferences = await NotificationPreferences.findOne({ userId: user._id })
        
        if (!preferences) {
            // Create default preferences
            preferences = new NotificationPreferences({
                userId: user._id,
                assignments: true,
                meetings: true,
                fieldService: true,
                announcements: true,
                emergencies: true,
                method: 'email',
                quietHours: {
                    enabled: false,
                    start: '22:00',
                    end: '08:00'
                }
            })
            await preferences.save()
        }

        return JSON.parse(JSON.stringify(preferences))
    } catch (error) {
        console.error('Error fetching notification preferences:', error)
        throw error
    }
}

async function _sendTestNotification(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        await sendPushNotification({
            userId: user._id as string,
            to: user._id as string,
            message: 'This is a test notification to verify your notification settings are working correctly.',
            priority: 'low'
        })

        await logActivity({
            userId: user._id as string,
            type: 'test_notification',
            action: `${user.fullName} sent test notification`,
            details: { entityType: 'Notification' }
        })

        return { success: true }
    } catch (error) {
        console.error('Error sending test notification:', error)
        throw error
    }
}

async function _getNotificationStats(user: User) {
    try {
        if (!user) throw new Error("User not authorized")
        await connectToDB()
        
        const [total, unread, byType, byPriority] = await Promise.all([
            Notification.countDocuments({ userId: user._id }),
            Notification.countDocuments({ userId: user._id, status: { $ne: 'read' } }),
            Notification.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]),
            Notification.aggregate([
                { $match: { userId: user._id } },
                { $group: { _id: '$priority', count: { $sum: 1 } } }
            ])
        ])

        return {
            total,
            unread,
            byType: byType.reduce((acc: any, item: any) => {
                acc[item._id] = item.count
                return acc
            }, {}),
            byPriority: byPriority.reduce((acc: any, item: any) => {
                acc[item._id] = item.count
                return acc
            }, {})
        }
    } catch (error) {
        console.error('Error getting notification stats:', error)
        throw error
    }
}

export const fetchNotifications = await withAuth(_fetchNotifications)
export const markNotificationAsRead = await withAuth(_markNotificationAsRead)
export const updateNotificationPreferences = await withAuth(_updateNotificationPreferences)
export const fetchNotificationPreferences = await withAuth(_fetchNotificationPreferences)
export const sendTestNotification = await withAuth(_sendTestNotification)
export const getNotificationStats = await withAuth(_getNotificationStats)