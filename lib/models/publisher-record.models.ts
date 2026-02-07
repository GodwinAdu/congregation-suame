import mongoose, { Schema, Document } from 'mongoose';

export interface IPublisherRecord extends Document {
  memberId: mongoose.Types.ObjectId;
  baptismDate?: Date;
  baptismLocation?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  appointments: Array<{
    privilege: string;
    appointmentDate: Date;
    deletionDate?: Date;
    reason?: string;
    notes?: string;
  }>;
  serviceYears: Array<{
    year: string;
    totalHours: number;
    totalPlacements: number;
    totalReturnVisits: number;
    totalBibleStudies: number;
    averageHours: number;
    monthsReported: number;
    pioneerMonths: number;
    auxiliaryMonths: number;
  }>;
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  medicalInfo: {
    bloodType?: string;
    allergies?: string;
    medications?: string;
    conditions?: string;
    noBloodCard?: boolean;
  };
  transferHistory: Array<{
    fromCongregation?: string;
    toCongregation?: string;
    transferDate: Date;
    reason?: string;
    notes?: string;
  }>;
  notes: Array<{
    date: Date;
    category: 'general' | 'privileges' | 'service' | 'conduct' | 'other';
    content: string;
    addedBy: mongoose.Types.ObjectId;
  }>;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PublisherRecordSchema = new Schema<IPublisherRecord>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true, unique: true },
    baptismDate: { type: Date },
    baptismLocation: { type: String },
    dateOfBirth: { type: Date },
    placeOfBirth: { type: String },
    appointments: [{
      privilege: String,
      appointmentDate: Date,
      deletionDate: Date,
      reason: String,
      notes: String
    }],
    serviceYears: [{
      year: String,
      totalHours: Number,
      totalPlacements: Number,
      totalReturnVisits: Number,
      totalBibleStudies: Number,
      averageHours: Number,
      monthsReported: Number,
      pioneerMonths: Number,
      auxiliaryMonths: Number
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    medicalInfo: {
      bloodType: String,
      allergies: String,
      medications: String,
      conditions: String,
      noBloodCard: { type: Boolean, default: false }
    },
    transferHistory: [{
      fromCongregation: String,
      toCongregation: String,
      transferDate: Date,
      reason: String,
      notes: String
    }],
    notes: [{
      date: Date,
      category: { type: String, enum: ['general', 'privileges', 'service', 'conduct', 'other'] },
      content: String,
      addedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

PublisherRecordSchema.index({ memberId: 1 });
PublisherRecordSchema.index({ congregationId: 1 });

export default mongoose.models.PublisherRecord || mongoose.model<IPublisherRecord>('PublisherRecord', PublisherRecordSchema);
