import { Schema, model, models } from 'mongoose';

const PublicTalkSchema = new Schema({
  date: { type: Date, required: true },
  eventType: { type: String, enum: ['public-talk', 'convention', 'co-visit', 'special-program', 'other'], default: 'public-talk' },
  eventTitle: { type: String },
  talkNumber: { type: String },
  talkTitle: { type: String },
  speaker: { type: Schema.Types.ObjectId, ref: 'Member' },
  chairman: { type: Schema.Types.ObjectId, ref: 'Member' },
  assistant: { type: Schema.Types.ObjectId, ref: 'Member' },
  isVisitingSpeaker: { type: Boolean, default: false },
  visitingSpeakerName: { type: String },
  visitingCongregation: { type: String },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true }
}, { timestamps: true });

PublicTalkSchema.index({ date: 1 }, { unique: true });

const PublicTalk = models.PublicTalk || model('PublicTalk', PublicTalkSchema);
export default PublicTalk;
