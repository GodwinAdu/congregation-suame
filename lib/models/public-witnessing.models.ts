import mongoose, { Document, Schema } from 'mongoose';

export interface IPublicWitnessing extends Document {
    location: string;
    date: Date;
    startTime: string;
    endTime: string;
    participants: Array<{
        memberId: string;
        memberName: string;
        role: 'coordinator' | 'participant';
    }>;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const PublicWitnessingSchema: Schema = new Schema({
    location: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    participants: [{
        memberId: { type: String, required: true },
        memberName: { type: String, required: true },
        role: { type: String, enum: ['coordinator', 'participant'], default: 'participant' }
    }],
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    notes: { type: String },
    createdBy: { type: String, required: true }
}, {
    timestamps: true
});

const PublicWitnessing = mongoose.models.PublicWitnessing || mongoose.model<IPublicWitnessing>('PublicWitnessing', PublicWitnessingSchema);

export default PublicWitnessing;