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
                "member_create",
                "profile_update",
                "password_change",
                "email_verification",
                "status_change",
                "role_change",
                "file_upload",
                "report_generate",
                "system_access",
                "privileges_update",
                "assignment_create",
                "assignment_update",
                "assignment_sync",
                "attendance_record",
                "attendance_update",
                "report_submit",
                "report_update",
                "transport_join_status",
                "transport_fee_create",
                "transport_fee_update",
                "transport_fee_delete",
                "transport_payment",
                "invitation_sent",
                "password_reset",
                "territory_create",
                "territory_assign",
                "return_visit_create",
                "visit_record",
                "contribution_record",
                "expense_create",
                "budget_create",
                "message_send",
                "broadcast_create",
                "announcement_create",
                "event_create",
                "document_upload",
                "form_submit",
                "ai_suggestion",
                "engagement_analysis",
                "conflict_detection",
                "insights_generate",
                "notification_send",
                "preferences_update",
                "test_notification"
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