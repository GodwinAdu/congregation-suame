import mongoose, { Schema, Document } from "mongoose";

export interface IFieldServiceReport extends Document {
    publisher: mongoose.Types.ObjectId; // link to publisher/user
    month: string; // e.g. "2025-09"
    placements?: number;
    videos?: number;
    hours?: number; // optional
    returnVisits?: number;
    bibleStudents: number;
    auxiliaryPioneer?: boolean;
    check: boolean;
    comments?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const FieldServiceReportSchema: Schema<IFieldServiceReport> = new Schema(
    {
        publisher: { type: Schema.Types.ObjectId, ref: "Member", required: true },
        month: { type: String, required: true }, // YYYY-MM
        hours: { type: Number,default:0 }, // optional
        bibleStudents: { type: Number, required: true, default: 0 },
        auxiliaryPioneer: { type: Boolean, default: false },
        check: { type: Boolean, default: false },
        comments: { type: String,default:'' },
    },
    { timestamps: true }
);

export default mongoose.models.FieldServiceReport ||
    mongoose.model<IFieldServiceReport>("FieldServiceReport", FieldServiceReportSchema);
