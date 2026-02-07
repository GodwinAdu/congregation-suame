import mongoose, { Schema, Document } from 'mongoose';

export interface IBibleStudy extends Document {
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentAddress?: string;
  conductorId: mongoose.Types.ObjectId;
  assistantId?: mongoose.Types.ObjectId;
  publication: string;
  currentLesson: number;
  totalLessons: number;
  startDate: Date;
  studyDay: string;
  studyTime: string;
  location: string;
  status: 'active' | 'inactive' | 'completed' | 'discontinued';
  goals: Array<{
    description: string;
    targetDate?: Date;
    completed: boolean;
    completedDate?: Date;
  }>;
  milestones: Array<{
    type: 'first_meeting' | 'first_comment' | 'first_prayer' | 'unbaptized_publisher' | 'baptism' | 'custom';
    description: string;
    date: Date;
    notes?: string;
  }>;
  sessions: Array<{
    date: Date;
    lessonNumber: number;
    attended: boolean;
    duration?: number;
    topics?: string;
    notes?: string;
    engagement: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  notes?: string;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BibleStudySchema = new Schema<IBibleStudy>(
  {
    studentName: { type: String, required: true },
    studentEmail: { type: String },
    studentPhone: { type: String },
    studentAddress: { type: String },
    conductorId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    assistantId: { type: Schema.Types.ObjectId, ref: 'Member' },
    publication: { type: String, required: true },
    currentLesson: { type: Number, default: 1 },
    totalLessons: { type: Number, required: true },
    startDate: { type: Date, required: true },
    studyDay: { type: String, required: true },
    studyTime: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'completed', 'discontinued'], default: 'active' },
    goals: [{
      description: String,
      targetDate: Date,
      completed: { type: Boolean, default: false },
      completedDate: Date
    }],
    milestones: [{
      type: { type: String, enum: ['first_meeting', 'first_comment', 'first_prayer', 'unbaptized_publisher', 'baptism', 'custom'] },
      description: String,
      date: Date,
      notes: String
    }],
    sessions: [{
      date: Date,
      lessonNumber: Number,
      attended: Boolean,
      duration: Number,
      topics: String,
      notes: String,
      engagement: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
    }],
    notes: { type: String },
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

BibleStudySchema.index({ conductorId: 1, status: 1 });
BibleStudySchema.index({ congregationId: 1, status: 1 });

export default mongoose.models.BibleStudy || mongoose.model<IBibleStudy>('BibleStudy', BibleStudySchema);
