import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
    week: string; // e.g. "2024-12-02" (Monday date)
    meetingType: "Midweek" | "Weekend";
    assignmentType: "Watchtower Reader" | "Bible Student Reader" | "Life and Ministry" | "Public Talk Speaker";
    title: string;
    description?: string;
    assignedTo?: mongoose.Types.ObjectId;
    assistant?: mongoose.Types.ObjectId; // For demonstrations
    duration?: number; // in minutes
    source?: string; // Bible reading, publication reference
    createdAt?: Date;
    updatedAt?: Date;
}

const AssignmentSchema: Schema<IAssignment> = new Schema(
    {
        week: { type: String, required: true },
        meetingType: { type: String, enum: ["Midweek", "Weekend"], required: true },
        assignmentType: { 
            type: String, 
            enum: ["Watchtower Reader", "Bible Student Reader", "Life and Ministry", "Public Talk Speaker"], 
            required: true 
        },
        title: { type: String, required: true },
        description: { type: String },
        assignedTo: { type: Schema.Types.ObjectId, ref: "Member" },
        assistant: { type: Schema.Types.ObjectId, ref: "Member" },
        duration: { type: Number },
        source: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Assignment ||
    mongoose.model<IAssignment>("Assignment", AssignmentSchema);