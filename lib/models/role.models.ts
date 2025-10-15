import { model, models, Schema } from "mongoose";

export interface IRole {
    _id: string;
    name: string;
    dashboard: boolean;
    config: boolean;
    manageGroupMembers: boolean;
    manageAllReport: boolean;
    manageGroupReport: boolean;
    manageAllMembers: boolean;
    manageUser: boolean;
    manageAttendance: boolean;
    transport: boolean;
    history: boolean;
    trash: boolean;
    monthlyReport: boolean;
    assignments: boolean;
    cleaning: boolean;
    territory: boolean;
    financial: boolean;
    communication: boolean;
    events: boolean;
    documents: boolean;
    aiAssistant: boolean;
    notifications: boolean;
}

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
        },
        monthlyReport: {
            type: Boolean,
            default: false
        },
        assignments: {
            type: Boolean,
            default: false
        },
        cleaning: {
            type: Boolean,
            default: false
        },
        territory: {
            type: Boolean,
            default: false
        },
        financial: {
            type: Boolean,
            default: false
        },
        communication: {
            type: Boolean,
            default: false
        },
        events: {
            type: Boolean,
            default: false
        },
        documents: {
            type: Boolean,
            default: false
        },
        aiAssistant: {
            type: Boolean,
            default: false
        },
        notifications: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});


const Role = models.Role ?? model("Role", RoleSchema);

export default Role;