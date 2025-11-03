import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupSchedule extends Document {
    groupId: string;
    month: string;
    scheduledDate?: Date;
    status: 'scheduled' | 'completed' | 'pending';
    completedDate?: Date;
    overseerUserId: string;
    overseerName: string;
    createdAt: Date;
    updatedAt: Date;
}

const GroupScheduleSchema: Schema = new Schema({
    groupId: { type: String, required: true },
    month: { type: String, required: true },
    scheduledDate: { type: Date },
    status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'pending'], 
        default: 'pending' 
    },
    completedDate: { type: Date },
    overseerUserId: { type: String, required: true },
    overseerName: { type: String, required: true }
}, {
    timestamps: true
});

// Index for performance, but not unique to allow multiple visits per group per month
GroupScheduleSchema.index({ groupId: 1, month: 1 });
GroupScheduleSchema.index({ overseerUserId: 1, month: 1 });

const GroupSchedule = mongoose.models.GroupSchedule || mongoose.model<IGroupSchedule>('GroupSchedule', GroupScheduleSchema);


export default GroupSchedule;