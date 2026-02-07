import { model, models, Schema } from "mongoose";

const ShepherdingCallSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    shepherds: [{ type: Schema.Types.ObjectId, ref: "Member", required: true }],
    visitDate: { type: Date, required: true },
    visitType: { 
        type: String, 
        enum: ['routine', 'encouragement', 'counsel', 'illness', 'family_issue', 'spiritual_concern', 'other'],
        required: true 
    },
    location: {
        type: String,
        enum: ['home', 'kingdom_hall', 'phone', 'video_call', 'other'],
        default: 'home'
    },
    duration: { type: Number }, // in minutes
    notes: { type: String },
    scriptures: [{ type: String }],
    concerns: [{ type: String }],
    actionItems: [{ type: String }],
    followUpNeeded: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpNotes: { type: String },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    outcome: {
        type: String,
        enum: ['positive', 'neutral', 'needs_attention', 'urgent'],
    },
    isConfidential: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true });

const ShepherdingCall = models.ShepherdingCall || model("ShepherdingCall", ShepherdingCallSchema);

export default ShepherdingCall;
