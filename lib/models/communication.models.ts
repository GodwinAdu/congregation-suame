import { model, models, Schema } from "mongoose"

const MessageSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    to: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    subject: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['direct', 'group', 'broadcast'], default: 'direct' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    attachments: [String],
    readBy: [{
        userId: { type: Schema.Types.ObjectId, ref: "Member" },
        readAt: { type: Date, default: Date.now }
    }],
    isEmergency: { type: Boolean, default: false }
}, { timestamps: true })

const BroadcastSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    targetAudience: {
        type: { type: String, enum: ['all', 'group', 'role'], required: true },
        groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
        roles: [String]
    },
    scheduledFor: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
    deliveryMethod: [{ type: String, enum: ['email', 'sms', 'push', 'in-app'] }],
    recipients: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    deliveryStats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        read: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    }
}, { timestamps: true })

export const Message = models.Message || model("Message", MessageSchema)
export const Broadcast = models.Broadcast || model("Broadcast", BroadcastSchema)