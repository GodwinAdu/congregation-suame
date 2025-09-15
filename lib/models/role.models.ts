import { model, models, Schema } from "mongoose";


const RoleSchema = new Schema({
    name: String,
    permissions: {
        dashboard: {
            type: Boolean,
            default: false,
        },
        config:{type:Boolean,
            default:false
        },
        manageGroupMembers: {
            type: Boolean,
            default: false
        },
        manageAllReport: {
            type: Boolean,
            default: false
        },
        manageGroupReport: {
            type: Boolean,
            default: false
        },
        manageAllMembers: {
            type: Boolean,
            default: false
        },
        manageUser: {
            type: Boolean,
            default: false
        },
        manageAttendance: {
            type: Boolean,
            default: false
        },
        transport: {
            type: Boolean,
            default: false
        },
        history:{
            type:Boolean,
            default:false
        },
        trash:{
            type:Boolean,
            default:false
        }
    }
}, {
    timestamps: true
});


const Role = models.Role ?? model("Role", RoleSchema);

export default Role;