import { Schema, model, models } from 'mongoose';

// Appointment Recommendations
const appointmentRecommendationSchema = new Schema({
  brotherName: { type: String, required: true },
  currentPosition: { type: String, enum: ['publisher', 'ministerial_servant', 'elder'] },
  recommendedPosition: { type: String, enum: ['ministerial_servant', 'elder'], required: true },
  recommendationType: { type: String, enum: ['appointment', 'deletion'], required: true },
  qualifications: { type: String },
  spiritualProgress: { type: String },
  serviceRecord: { type: String },
  personalHistory: { type: String },
  bodyRecommendation: { type: String, enum: ['unanimous', 'majority', 'divided'] }
});

// Shepherding Visit Schedule
const shepherdingVisitSchema = new Schema({
  publisherName: { type: String, required: true },
  reason: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  accompaniedBy: { type: String }, // Elder or MS name
  notes: { type: String }
});

// Meeting Agenda Items
const meetingAgendaSchema = new Schema({
  topic: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  estimatedTime: { type: Number }, // in minutes
  category: { type: String, enum: ['organizational', 'spiritual', 'practical', 'other'] }
});

// Field Service Arrangements
const fieldServiceSchema = new Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['house_to_house', 'public_witnessing', 'return_visits', 'bible_studies'] },
  accompaniedBy: { type: String }, // Publisher name
  notes: { type: String }
});

// Meal Arrangements
const mealArrangementSchema = new Schema({
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  hostFamily: { type: String, required: true },
  contactInfo: { type: String, required: true },
  specialRequests: { type: String },
  guestCount: { type: Number, default: 2 }
});

// Main CO Report Schema
const coReportSchema = new Schema({
  visitId: { type: Schema.Types.ObjectId, ref: 'COVisit', required: true },
  congregation: { type: String, required: true },
  visitDates: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  
  // Appointment Recommendations (S-62 Form)
  appointmentRecommendations: [appointmentRecommendationSchema],
  s62FormSubmitted: { type: Boolean, default: false },
  s62SubmissionDate: { type: Date },
  
  // Meeting Agenda
  eldersAgendaItems: [meetingAgendaSchema],
  
  // Shepherding Visits
  shepherdingVisits: [shepherdingVisitSchema],
  
  // Accommodations
  hostInformation: {
    hostName: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    address: { type: String },
    specialArrangements: { type: String }
  },
  
  // Meal Arrangements
  mealArrangements: [mealArrangementSchema],
  
  // Field Service Arrangements
  fieldServiceSchedule: [fieldServiceSchema],
  
  // Required Documents Checklist
  documentsChecklist: {
    publisherRecords: { type: Boolean, default: false }, // S-21
    attendanceRecords: { type: Boolean, default: false }, // S-88
    congregationAccounts: { type: Boolean, default: false },
    auditReports: { type: Boolean, default: false },
    khOperatingAccounts: { type: Boolean, default: false },
    publisherContactInfo: { type: Boolean, default: false },
    territoryRecords: { type: Boolean, default: false }, // S-13
    literatureMovement: { type: Boolean, default: false }, // S-28
    territoryVariety: { type: Boolean, default: false },
    publicWitnessingList: { type: Boolean, default: false }
  },
  
  // Additional Information
  specialNeeds: { type: String },
  congregationChallenges: { type: String },
  positiveHighlights: { type: String },
  followUpItems: { type: String },
  
  // Metadata
  preparedBy: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  coordinatorApproval: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  approvalDate: { type: Date },
  submittedToCO: { type: Boolean, default: false },
  submissionDate: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
coReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export interface ICOReport extends Document {
  _id: string;
  visitId: string;
  congregation: string;
  visitDates: {
    startDate: Date;
    endDate: Date;
  };
  appointmentRecommendations: Array<{
    brotherName: string;
    currentPosition: string;
    recommendedPosition: string;
    recommendationType: string;
    qualifications?: string;
    spiritualProgress?: string;
    serviceRecord?: string;
    personalHistory?: string;
    bodyRecommendation?: string;
  }>;
  s62FormSubmitted: boolean;
  s62SubmissionDate?: Date;
  eldersAgendaItems: Array<{
    topic: string;
    description?: string;
    priority: string;
    estimatedTime?: number;
    category: string;
  }>;
  shepherdingVisits: Array<{
    publisherName: string;
    reason: string;
    priority: string;
    accompaniedBy?: string;
    notes?: string;
  }>;
  hostInformation: {
    hostName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    specialArrangements?: string;
  };
  mealArrangements: Array<{
    date: Date;
    mealType: string;
    hostFamily: string;
    contactInfo: string;
    specialRequests?: string;
    guestCount: number;
  }>;
  fieldServiceSchedule: Array<{
    date: Date;
    time: string;
    location: string;
    type: string;
    accompaniedBy?: string;
    notes?: string;
  }>;
  documentsChecklist: {
    publisherRecords: boolean;
    attendanceRecords: boolean;
    congregationAccounts: boolean;
    auditReports: boolean;
    khOperatingAccounts: boolean;
    publisherContactInfo: boolean;
    territoryRecords: boolean;
    literatureMovement: boolean;
    territoryVariety: boolean;
    publicWitnessingList: boolean;
  };
  specialNeeds?: string;
  congregationChallenges?: string;
  positiveHighlights?: string;
  followUpItems?: string;
  preparedBy: string;
  coordinatorApproval: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  submittedToCO: boolean;
  submissionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const COReport = models.COReport || model<ICOReport>('COReport', coReportSchema);