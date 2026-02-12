import { Schema, model, models } from 'mongoose';

const ReaderAssignmentSchema = new Schema({
  date: { type: Date, required: true },
  meetingType: { type: String, enum: ['midweek', 'weekend'], required: true },
  studyType: { type: String, enum: ['bible-study', 'watchtower'], required: true },
  reader: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  assistant: { type: Schema.Types.ObjectId, ref: 'Member' },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true }
}, { timestamps: true });

ReaderAssignmentSchema.index({ date: 1, studyType: 1 }, { unique: true });

const ReaderAssignment = models.ReaderAssignment || model('ReaderAssignment', ReaderAssignmentSchema);
export default ReaderAssignment;
