import mongoose, { Document, Schema } from 'mongoose';

export interface IOverseerReport extends Document {
    groupId: string;
    month: string;
    visitDate: Date;
    meetingAttendance: string;
    fieldServiceParticipation: string;
    generalObservations: string;
    encouragement: string;
    recommendations: string;
    followUpNeeded: boolean;
    followUpNotes?: string;
    members: Array<{
        id: string;
        name: string;
        present: boolean;
        hasStudy: boolean;
        participatesInMinistry: boolean;
    }>;
    overseerUserId: string;
    overseerName: string;
    createdAt: Date;
    updatedAt: Date;
}

const OverseerReportSchema: Schema = new Schema({
    groupId: { type: String, required: true },
    month: { type: String, required: true },
    visitDate: { type: Date, required: true },
    meetingAttendance: { type: String, required: true },
    fieldServiceParticipation: { type: String, required: true },
    generalObservations: { type: String, required: true },
    encouragement: { type: String, required: true },
    recommendations: { type: String, required: true },
    followUpNeeded: { type: Boolean, default: false },
    followUpNotes: { type: String },
    members: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        present: { type: Boolean, default: false },
        hasStudy: { type: Boolean, default: false },
        participatesInMinistry: { type: Boolean, default: false }
    }],
    overseerUserId: { type: String, required: true },
    overseerName: { type: String, required: true }
}, {
    timestamps: true
});


const OverseerReport = mongoose.models.OverseerReport || mongoose.model<IOverseerReport>('OverseerReport', OverseerReportSchema);

export default OverseerReport;