import { Document, model, Schema, models } from "mongoose";

export interface ICOVisit extends Document {
  _id: string;
  visitNumber: number;
  circuitOverseer: {
    name: string;
    email?: string;
    phone?: string;
  };
  visitDates: {
    startDate: Date;
    endDate: Date;
  };
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  
  // Meeting Schedule
  meetings: {
    midweekMeeting?: {
      date: Date;
      time: string;
      talk?: string;
      notes?: string;
    };
    weekendMeeting?: {
      date: Date;
      time: string;
      talk?: string;
      notes?: string;
    };
    eldersMeeting?: {
      date: Date;
      time: string;
      agenda?: string[];
      notes?: string;
    };
    ministerialServantsMeeting?: {
      date: Date;
      time: string;
      agenda?: string[];
      notes?: string;
    };
  };
  
  // Field Service Activities
  fieldService: {
    groupVisits: [{
      groupNumber: number;
      date: Date;
      time: string;
      groupOverseer: string;
      notes?: string;
    }];
    publicWitnessing?: {
      date: Date;
      time: string;
      location: string;
      participants: string[];
      notes?: string;
    };
  };
  
  // Individual Meetings
  shepherdingCalls: [{
    memberName: string;
    memberId: Schema.Types.ObjectId;
    date: Date;
    time: string;
    purpose: string;
    notes?: string;
    completed: boolean;
  }];
  
  // Reports and Recommendations
  congregationReport: {
    publishers: number;
    pioneers: number;
    elderlyOnes: number;
    attendance: {
      midweek: number;
      weekend: number;
    };
    fieldServiceHours: number;
    baptisms: number;
    recommendations?: string;
  };
  
  // Appointments and Recommendations
  appointments: [{
    type: 'elder' | 'ministerial_servant' | 'pioneer' | 'other';
    memberName: string;
    memberId: Schema.Types.ObjectId;
    recommendation: string;
    approved: boolean;
    notes?: string;
  }];
  
  packet?: any;

  // General Notes and Observations
  generalNotes?: string;
  commendations?: string[];
  suggestions?: string[];
  
  // Administrative
  createdBy: Schema.Types.ObjectId;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const COVisitSchema = new Schema({
  visitNumber: { type: Number, required: true },
  circuitOverseer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String }
  },
  visitDates: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  
  meetings: {
    midweekMeeting: {
      date: { type: Date },
      time: { type: String },
      talk: { type: String },
      notes: { type: String }
    },
    weekendMeeting: {
      date: { type: Date },
      time: { type: String },
      talk: { type: String },
      notes: { type: String }
    },
    eldersMeeting: {
      date: { type: Date },
      time: { type: String },
      agenda: [{ type: String }],
      notes: { type: String }
    },
    ministerialServantsMeeting: {
      date: { type: Date },
      time: { type: String },
      agenda: [{ type: String }],
      notes: { type: String }
    }
  },
  
  fieldService: {
    groupVisits: [{
      groupNumber: { type: Number, required: true },
      date: { type: Date, required: true },
      time: { type: String, required: true },
      groupOverseer: { type: String, required: true },
      notes: { type: String }
    }],
    publicWitnessing: {
      date: { type: Date },
      time: { type: String },
      location: { type: String },
      participants: [{ type: String }],
      notes: { type: String }
    }
  },
  
  shepherdingCalls: [{
    memberName: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    purpose: { type: String, required: true },
    notes: { type: String },
    completed: { type: Boolean, default: false }
  }],
  
  congregationReport: {
    publishers: { type: Number, default: 0 },
    pioneers: { type: Number, default: 0 },
    elderlyOnes: { type: Number, default: 0 },
    attendance: {
      midweek: { type: Number, default: 0 },
      weekend: { type: Number, default: 0 }
    },
    fieldServiceHours: { type: Number, default: 0 },
    baptisms: { type: Number, default: 0 },
    recommendations: { type: String }
  },
  
  appointments: [{
    type: { 
      type: String, 
      enum: ['elder', 'ministerial_servant', 'pioneer', 'other'], 
      required: true 
    },
    memberName: { type: String, required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    recommendation: { type: String, required: true },
    approved: { type: Boolean, default: false },
    notes: { type: String }
  }],
  
  generalNotes: { type: String },
  commendations: [{ type: String }],
  suggestions: [{ type: String }],

  // S-61 "Information needed for visit of circuit overseer" packet
  packet: {
    checklist: [{
      key: { type: String, required: true },
      status: { type: String, enum: ['ready', 'not_ready', 'na'], default: 'not_ready' },
      note: { type: String },
      updatedAt: { type: Date },
      updatedBy: { type: Schema.Types.ObjectId, ref: "Member" }
    }],
    questionnaire: [{
      key: { type: String, required: true },
      answer: { type: String, enum: ['Y', 'N', 'NA'] },
      note: { type: String }
    }],
    host: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      notes: { type: String }
    },
    meals: [{
      date: { type: Date },
      hostName: { type: String, required: true },
      phone: { type: String },
      notes: { type: String }
    }],
    recommendations: [{
      memberId: { type: Schema.Types.ObjectId, ref: "Member" },
      memberName: { type: String, required: true },
      action: {
        type: String,
        enum: ['appoint_elder', 'appoint_ms', 'delete_elder', 'delete_ms'],
        required: true
      },
      notes: { type: String }
    }],
    s62SubmittedOn: { type: Date },
    // Reminder milestones already sent, e.g. "42", "14", "3", "s62"
    remindersSent: [{ type: String }],
    agendaItems: [{ type: String }],
    fieldMinistry: [{
      date: { type: Date },
      period: { type: String },
      partnerName: { type: String, required: true },
      memberId: { type: Schema.Types.ObjectId, ref: "Member" },
      notes: { type: String }
    }],
    visitTerritories: [{
      territoryId: { type: Schema.Types.ObjectId, ref: "Territory" },
      number: { type: String },
      name: { type: String }
    }]
  },
  
  createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
COVisitSchema.index({ visitNumber: 1 });
COVisitSchema.index({ 'visitDates.startDate': 1 });
COVisitSchema.index({ status: 1 });
COVisitSchema.index({ 'circuitOverseer.name': 1 });

export const COVisit = models.COVisit || model("COVisit", COVisitSchema);