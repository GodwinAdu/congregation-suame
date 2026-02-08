import { Schema, model, models, Document } from 'mongoose';

export interface IDailyFieldServiceReport extends Document {
  publisher: Schema.Types.ObjectId;
  date: Date;
  month: string; // Format: YYYY-MM
  sharedInMinistry: boolean;
  hours: number;
  placements: number;
  videos: number;
  bibleStudies: number;
  bibleStudyIds: string[]; // IDs of Bible studies visited
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyFieldServiceReportSchema = new Schema({
  publisher: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  date: { type: Date, required: true },
  month: { type: String, required: true }, // Auto-set from date
  sharedInMinistry: { type: Boolean, default: false },
  hours: { type: Number, default: 0, min: 0 },
  placements: { type: Number, default: 0, min: 0 },
  videos: { type: Number, default: 0, min: 0 },
  bibleStudies: { type: Number, default: 0, min: 0 },
  bibleStudyIds: [{ type: String }], // Array of Bible study IDs
  comments: { type: String },
}, { timestamps: true });

// Indexes
DailyFieldServiceReportSchema.index({ publisher: 1, date: 1 }, { unique: true });
DailyFieldServiceReportSchema.index({ publisher: 1, month: 1 });
DailyFieldServiceReportSchema.index({ month: 1 });

// Auto-set month from date before saving
DailyFieldServiceReportSchema.pre('save', function(next) {
  if (this.date) {
    this.month = this.date.toISOString().slice(0, 7);
  }

});

const DailyFieldServiceReport = models.DailyFieldServiceReport || 
  model<IDailyFieldServiceReport>('DailyFieldServiceReport', DailyFieldServiceReportSchema);

export default DailyFieldServiceReport;
