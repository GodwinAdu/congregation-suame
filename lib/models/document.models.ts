import { model, models, Schema } from "mongoose"

const DocumentSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    type: { 
        type: String, 
        enum: ['form', 'letter', 'publication', 'meeting-material', 'policy', 'other'],
        required: true 
    },
    category: String,
    fileUrl: { type: String, required: true },
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    accessLevel: { 
        type: String, 
        enum: ['public', 'elders-only', 'servants-only', 'publishers-only'],
        default: 'public' 
    },
    tags: [String],
    version: { type: Number, default: 1 },
    parentDocument: { type: Schema.Types.ObjectId, ref: "Document" },
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const FormSubmissionSchema = new Schema({
    formType: { 
        type: String, 
        enum: ['s-21', 's-13', 's-8', 's-79', 'pioneer-application', 'other'],
        required: true 
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    data: Schema.Types.Mixed,
    status: { type: String, enum: ['submitted', 'under-review', 'approved', 'rejected'], default: 'submitted' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Member" },
    reviewNotes: String,
    digitalSignature: String,
    attachments: [String]
}, { timestamps: true })

export const Document = models.Document || model("Document", DocumentSchema)
export const FormSubmission = models.FormSubmission || model("FormSubmission", FormSubmissionSchema)