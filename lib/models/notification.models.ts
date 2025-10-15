import { model, models, Schema } from "mongoose"

const NotificationPreferencesSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    assignments: { type: Boolean, default: true },
    meetings: { type: Boolean, default: true },
    fieldService: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    emergencies: { type: Boolean, default: true },
    method: { type: String, enum: ['email', 'sms', 'push'], default: 'email' },
    quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' }
    }
}, { timestamps: true })

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    type: { 
        type: String, 
        enum: ['assignment', 'meeting', 'announcement', 'reminder', 'emergency'],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'read', 'failed'], default: 'pending' },
    scheduledFor: Date,
    readAt: Date,
    metadata: Schema.Types.Mixed
}, { timestamps: true })

export const NotificationPreferences = models.NotificationPreferences || model("NotificationPreferences", NotificationPreferencesSchema)
export const Notification = models.Notification || model("Notification", NotificationSchema)