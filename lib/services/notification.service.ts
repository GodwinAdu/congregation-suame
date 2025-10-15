import { connectToDB } from "../mongoose"
import { Notification, NotificationPreferences } from "../models/notification.models"
import { wrappedSendMail } from "./email.service"

interface NotificationData {
    userId: string
    type: 'assignment' | 'meeting' | 'announcement' | 'reminder' | 'emergency'
    title: string
    message: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    scheduledFor?: Date
    metadata?: any
}

export class NotificationService {
    // Send notification to user
    static async sendNotification(data: NotificationData): Promise<void> {
        await connectToDB()

        // Create notification record
        const notification = new Notification(data)
        await notification.save()

        // Get user preferences
        const preferences = await NotificationPreferences.findOne({ userId: data.userId })
        
        if (!preferences || !this.shouldSendNotification(preferences, data)) {
            return
        }

        // Check quiet hours
        if (this.isQuietHours(preferences)) {
            notification.scheduledFor = this.getNextAvailableTime(preferences)
            await notification.save()
            return
        }

        // Send based on preferred method
        await this.deliverNotification(notification, preferences)
    }

    // Send bulk notifications
    static async sendBulkNotifications(userIds: string[], data: Omit<NotificationData, 'userId'>): Promise<void> {
        const notifications = userIds.map(userId => ({
            ...data,
            userId
        }))

        for (const notificationData of notifications) {
            await this.sendNotification(notificationData)
        }
    }

    // Schedule reminder notifications
    static async scheduleReminders(): Promise<void> {
        await connectToDB()

        // Get pending notifications
        const pendingNotifications = await Notification.find({
            status: 'pending',
            scheduledFor: { $lte: new Date() }
        }).populate('userId')

        for (const notification of pendingNotifications) {
            const preferences = await NotificationPreferences.findOne({ 
                userId: notification.userId 
            })
            
            if (preferences) {
                await this.deliverNotification(notification, preferences)
            }
        }
    }

    // Auto-generate assignment reminders
    static async generateAssignmentReminders(): Promise<void> {
        const Assignment = (await import("../models/assignment.models")).default
        
        // Get assignments for next week
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        const weekString = nextWeek.toISOString().split('T')[0]

        const assignments = await Assignment.find({ week: weekString })
            .populate('assignedTo assistant')

        for (const assignment of assignments) {
            if (assignment.assignedTo) {
                await this.sendNotification({
                    userId: assignment.assignedTo._id.toString(),
                    type: 'assignment',
                    title: 'Upcoming Assignment Reminder',
                    message: `You have an assignment: ${assignment.title} for the week of ${weekString}`,
                    priority: 'medium',
                    metadata: { assignmentId: assignment._id }
                })
            }

            if (assignment.assistant) {
                await this.sendNotification({
                    userId: assignment.assistant._id.toString(),
                    type: 'assignment',
                    title: 'Assistant Assignment Reminder',
                    message: `You are assigned as assistant for: ${assignment.title} for the week of ${weekString}`,
                    priority: 'medium',
                    metadata: { assignmentId: assignment._id }
                })
            }
        }
    }

    // Push notification support
    static async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
        // Implementation would integrate with Firebase Cloud Messaging or similar
        console.log(`Push notification to ${userId}: ${title} - ${body}`)
    }

    // SMS notification support
    static async sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
        // Implementation would integrate with Twilio or similar SMS service
        console.log(`SMS to ${phoneNumber}: ${message}`)
    }

    private static shouldSendNotification(preferences: any, data: NotificationData): boolean {
        switch (data.type) {
            case 'assignment':
                return preferences.assignments
            case 'meeting':
                return preferences.meetings
            case 'announcement':
                return preferences.announcements
            case 'emergency':
                return preferences.emergencies
            default:
                return true
        }
    }

    private static isQuietHours(preferences: any): boolean {
        if (!preferences.quietHours.enabled) return false

        const now = new Date()
        const currentTime = now.getHours() * 100 + now.getMinutes()
        const startTime = this.parseTime(preferences.quietHours.start)
        const endTime = this.parseTime(preferences.quietHours.end)

        if (startTime > endTime) {
            // Quiet hours span midnight
            return currentTime >= startTime || currentTime <= endTime
        } else {
            return currentTime >= startTime && currentTime <= endTime
        }
    }

    private static parseTime(timeString: string): number {
        const [hours, minutes] = timeString.split(':').map(Number)
        return hours * 100 + minutes
    }

    private static getNextAvailableTime(preferences: any): Date {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const [hours, minutes] = preferences.quietHours.end.split(':').map(Number)
        tomorrow.setHours(hours, minutes, 0, 0)
        return tomorrow
    }

    private static async deliverNotification(notification: any, preferences: any): Promise<void> {
        try {
            switch (preferences.method) {
                case 'email':
                    await wrappedSendMail({
                        from: `"Suame Congregation" <${process.env.SMTP_USER}>`,
                        to: notification.userId.email,
                        subject: notification.title,
                        html: `<p>${notification.message}</p>`
                    })
                    break
                case 'sms':
                    if (notification.userId.phoneNumber) {
                        await this.sendSMSNotification(notification.userId.phoneNumber, notification.message)
                    }
                    break
                case 'push':
                    await this.sendPushNotification(
                        notification.userId._id.toString(),
                        notification.title,
                        notification.message,
                        notification.metadata
                    )
                    break
            }

            notification.status = 'sent'
            await notification.save()
        } catch (error) {
            notification.status = 'failed'
            await notification.save()
            console.error('Failed to deliver notification:', error)
        }
    }
}