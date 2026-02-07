import { Document, model, Schema, models } from "mongoose";

export interface ITerritory extends Document {
  number: string;
  name: string;
  description?: string;
  boundaries?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
  center?: {
    latitude: number;
    longitude: number;
  };
  area?: number; // in square kilometers
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'residential' | 'business' | 'rural' | 'apartment' | 'mixed';
  isActive: boolean;
  lastWorked?: Date;
  completedDate?: Date;
  estimatedHours: number;
  householdCount?: number;
  notes?: string;
  kmlData?: string; // Original KML/KMZ data
  assignedGroup?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITerritoryAssignment extends Document {
  territoryId: Schema.Types.ObjectId;
  publisherId: Schema.Types.ObjectId;
  assignedDate: Date;
  dueDate?: Date;
  returnedDate?: Date;
  status: 'assigned' | 'completed' | 'overdue' | 'returned';
  workStarted?: Date;
  workCompleted?: Date;
  hoursWorked?: number;
  householdsVisited?: number;
  notes?: string;
  assignedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TerritorySchema = new Schema({
  number: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  boundaries: {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'] },
    coordinates: { type: [[[Number]]] }
  },
  center: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  area: { type: Number },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  type: { type: String, enum: ['residential', 'business', 'rural', 'apartment', 'mixed'], default: 'residential' },
  isActive: { type: Boolean, default: true },
  lastWorked: { type: Date },
  completedDate: { type: Date },
  estimatedHours: { type: Number, default: 2 },
  householdCount: { type: Number },
  notes: { type: String },
  kmlData: { type: String },
  assignedGroup: { type: Schema.Types.ObjectId, ref: "Group" },
  createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true }
}, { timestamps: true });

const TerritoryAssignmentSchema = new Schema({
  territoryId: { type: Schema.Types.ObjectId, ref: "Territory", required: true },
  publisherId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  returnedDate: { type: Date },
  status: { type: String, enum: ['assigned', 'completed', 'overdue', 'returned'], default: 'assigned' },
  workStarted: { type: Date },
  workCompleted: { type: Date },
  hoursWorked: { type: Number },
  householdsVisited: { type: Number },
  notes: { type: String },
  assignedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true }
}, { timestamps: true });

// Indexes for performance
TerritorySchema.index({ number: 1 });
TerritorySchema.index({ isActive: 1 });
TerritorySchema.index({ 'center.latitude': 1, 'center.longitude': 1 });
TerritoryAssignmentSchema.index({ territoryId: 1, status: 1 });
TerritoryAssignmentSchema.index({ publisherId: 1, status: 1 });

export const Territory = models.Territory || model("Territory", TerritorySchema);
export const TerritoryAssignment = models.TerritoryAssignment || model("TerritoryAssignment", TerritoryAssignmentSchema);