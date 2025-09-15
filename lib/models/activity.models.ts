import { model, models, Schema } from "mongoose"

const ActivitySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Member",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "login",
                "logout", 
                "profile_update",
                "password_change",
                "building_access",
                "building_create",
                "building_update",
                "email_verification",
                "status_change",
                "role_change",
                "file_upload",
                "report_generate",
                "system_access"
            ],
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            entityId: String,
            entityType: String,
            oldValue: String,
            newValue: String,
            metadata: Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            default: "Unknown",
        },
        device: {
            type: String,
            default: "Unknown",
        },
        success: {
            type: Boolean,
            default: true,
        },
        errorMessage: String,
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

ActivitySchema.index({ userId: 1, createdAt: -1 })
ActivitySchema.index({ type: 1 })
ActivitySchema.index({ createdAt: -1 })

const Activity = models.Activity || model("Activity", ActivitySchema)

export default Activity