import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentHistory extends Document {
  memberId: mongoose.Types.ObjectId;
  assignmentType: string;
  assignmentDate: Date;
  meetingType: 'midweek' | 'weekend';
  partNumber?: string;
  duration?: number;
  notes?: string;
  completed: boolean;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentHistorySchema = new Schema<IAssignmentHistory>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    assignmentType: { type: String, required: true },
    assignmentDate: { type: Date, required: true },
    meetingType: { type: String, enum: ['midweek', 'weekend'], required: true },
    partNumber: { type: String },
    duration: { type: Number },
    notes: { type: String },
    completed: { type: Boolean, default: false },
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

AssignmentHistorySchema.index({ memberId: 1, assignmentDate: -1 });
AssignmentHistorySchema.index({ congregationId: 1, assignmentDate: -1 });

export default mongoose.models.AssignmentHistory || mongoose.model<IAssignmentHistory>('AssignmentHistory', AssignmentHistorySchema);
