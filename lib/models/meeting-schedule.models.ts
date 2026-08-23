import mongoose, { Schema } from 'mongoose';

export interface IMeetingSchedule {
    meetingType: 'Midweek' | 'Weekend';
    day: string; // e.g., 'thursday', 'sunday'
    startTime: string; // e.g., '18:00'
    endTime: string; // e.g., '20:00'
    gracePeriodMinutes: number; // minutes after start before marking as late
    isActive: boolean;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MeetingScheduleSchema = new Schema<IMeetingSchedule>({
    meetingType: { type: String, enum: ['Midweek', 'Weekend'], required: true, unique: true },
    day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    startTime: { type: String, required: true }, // HH:mm format
    endTime: { type: String, required: true },
    gracePeriodMinutes: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
}, { timestamps: true });

const MeetingSchedule = mongoose.models.MeetingSchedule || mongoose.model<IMeetingSchedule>('MeetingSchedule', MeetingScheduleSchema);

export default MeetingSchedule;
