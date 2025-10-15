import { model, models, Schema } from "mongoose"

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    type: { 
        type: String, 
        enum: ['meeting', 'assembly', 'convention', 'memorial', 'co-visit', 'special-talk', 'other'],
        required: true 
    },
    startDate: { type: Date, required: true },
    endDate: Date,
    location: String,
    organizer: { type: Schema.Types.ObjectId, ref: "Member" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "Member" }],
    maxAttendees: Number,
    registrationRequired: { type: Boolean, default: false },
    registrationDeadline: Date,
    status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
    reminders: [{
        type: { type: String, enum: ['email', 'sms', 'push'] },
        timing: { type: String, enum: ['1-hour', '1-day', '1-week'] },
        sent: { type: Boolean, default: false }
    }]
}, { timestamps: true })

const AnnouncementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    targetAudience: {
        type: { type: String, enum: ['all', 'elders', 'servants', 'publishers', 'group'], default: 'all' },
        groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
        roles: [String]
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    expiresAt: Date,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    readBy: [{ 
        userId: { type: Schema.Types.ObjectId, ref: "Member" },
        readAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

export const Event = models.Event || model("Event", EventSchema)
export const Announcement = models.Announcement || model("Announcement", AnnouncementSchema)