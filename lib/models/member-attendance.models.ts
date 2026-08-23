import mongoose, { Schema, Document } from 'mongoose';

export interface IMemberAttendance extends Document {
    memberId: mongoose.Types.ObjectId;
    meetingDate: Date;
    meetingType: 'Midweek' | 'Weekend';
    present: boolean;
    status: 'present' | 'late' | 'absent';
    arrivalTime: string | null;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MemberAttendanceSchema = new Schema<IMemberAttendance>({
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    meetingDate: { type: Date, required: true },
    meetingType: { type: String, enum: ['Midweek', 'Weekend'], required: true },
    present: { type: Boolean, default: true },
    status: { type: String, enum: ['present', 'late', 'absent'], default: 'present' },
    arrivalTime: { type: String, default: null }, // HH:mm format
    createdBy: { type: Schema.Types.ObjectId, ref: 'Member' },
}, { timestamps: true });

// Prevent duplicate records for the same member on the same date
MemberAttendanceSchema.index({ memberId: 1, meetingDate: 1 }, { unique: true });
// Quick lookups by date
MemberAttendanceSchema.index({ meetingDate: 1, present: 1 });
// Quick lookups by member
MemberAttendanceSchema.index({ memberId: 1, present: 1 });

const MemberAttendance = mongoose.models.MemberAttendance || mongoose.model<IMemberAttendance>('MemberAttendance', MemberAttendanceSchema);

export default MemberAttendance;
