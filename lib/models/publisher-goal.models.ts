import mongoose, { Schema, Document } from 'mongoose';

export interface IPublisherGoal extends Document {
  memberId: mongoose.Types.ObjectId;
  goalType: 'hours' | 'placements' | 'return_visits' | 'bible_studies' | 'auxiliary_pioneer' | 'regular_pioneer' | 'custom';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  milestones: Array<{
    value: number;
    reached: boolean;
    reachedDate?: Date;
  }>;
  notificationsEnabled: boolean;
  lastNotificationDate?: Date;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PublisherGoalSchema = new Schema<IPublisherGoal>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    goalType: { 
      type: String, 
      enum: ['hours', 'placements', 'return_visits', 'bible_studies', 'auxiliary_pioneer', 'regular_pioneer', 'custom'],
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'cancelled', 'expired'], default: 'active' },
    milestones: [{
      value: Number,
      reached: { type: Boolean, default: false },
      reachedDate: Date
    }],
    notificationsEnabled: { type: Boolean, default: true },
    lastNotificationDate: { type: Date },
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

PublisherGoalSchema.index({ memberId: 1, status: 1 });
PublisherGoalSchema.index({ congregationId: 1, status: 1 });

export default mongoose.models.PublisherGoal || mongoose.model<IPublisherGoal>('PublisherGoal', PublisherGoalSchema);
