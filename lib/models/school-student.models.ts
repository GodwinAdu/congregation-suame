import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolStudent extends Document {
  memberId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  assignments: Array<{
    assignmentNumber: number;
    assignmentType: 'initial_call' | 'return_visit' | 'bible_study' | 'talk' | 'reading';
    title: string;
    scheduledDate: Date;
    completedDate?: Date;
    assistantId?: mongoose.Types.ObjectId;
    counselPoints: Array<{
      point: string;
      rating: 'excellent' | 'good' | 'needs_improvement';
      notes?: string;
    }>;
    overallRating?: 'excellent' | 'good' | 'needs_improvement';
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }>;
  progress: {
    totalAssignments: number;
    completedAssignments: number;
    excellentCount: number;
    goodCount: number;
    needsImprovementCount: number;
    lastAssignmentDate?: Date;
  };
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolStudentSchema = new Schema<ISchoolStudent>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentDate: { type: Date, required: true },
    currentLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    assignments: [{
      assignmentNumber: Number,
      assignmentType: { 
        type: String, 
        enum: ['initial_call', 'return_visit', 'bible_study', 'talk', 'reading']
      },
      title: String,
      scheduledDate: Date,
      completedDate: Date,
      assistantId: { type: Schema.Types.ObjectId, ref: 'User' },
      counselPoints: [{
        point: String,
        rating: { type: String, enum: ['excellent', 'good', 'needs_improvement'] },
        notes: String
      }],
      overallRating: { type: String, enum: ['excellent', 'good', 'needs_improvement'] },
      notes: String,
      status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
    }],
    progress: {
      totalAssignments: { type: Number, default: 0 },
      completedAssignments: { type: Number, default: 0 },
      excellentCount: { type: Number, default: 0 },
      goodCount: { type: Number, default: 0 },
      needsImprovementCount: { type: Number, default: 0 },
      lastAssignmentDate: Date
    },
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

SchoolStudentSchema.index({ memberId: 1 });
SchoolStudentSchema.index({ congregationId: 1 });

export default mongoose.models.SchoolStudent || mongoose.model<ISchoolStudent>('SchoolStudent', SchoolStudentSchema);
