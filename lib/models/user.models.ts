import { Document, model } from "mongoose";
import { Schema, models } from "mongoose";

export interface IUser extends Document {
    _id: string;
    fullName: string;
    phone: string;
    carStatus: boolean;
    payed: boolean;
    amount: number;
    balance: number;
    cardNumber: number;
    createdAt: Date;
    totalAmount?: number;
    updatedAt: Date;
}

const UserSchema = new Schema({
    fullName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        require: true
    },
    emergencyContact: {
        type: String,
        default: null
    },
    dob: {
        type: Date,
        default: null
    },
    baptizedDate: {
        type: Date,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: "publisher",
    },
    privileges: [{ type: Schema.Types.ObjectId, ref: "Privilege", default: [] }],
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    familyRelationships: [{
        memberId: { type: Schema.Types.ObjectId, ref: "Member" },
        relationship: {
            type: String,
            enum: ['father', 'mother', 'son', 'daughter', 'husband', 'wife', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter', 'uncle', 'aunt', 'nephew', 'niece', 'cousin', 'other']
        }
    }],
    isFamilyHead: {
        type: Boolean,
        default: false
    },
    duties: [{
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ['midweek_meeting', 'weekend_meeting', 'field_service', 'administrative', 'special_events']
        },
        assignedDate: { type: Date, default: Date.now },
        assignedBy: { type: Schema.Types.ObjectId, ref: "Member" },
        notes: String,
        isActive: { type: Boolean, default: true }
    }],
    location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        address: { type: String, default: null },
        lastUpdated: { type: Date, default: null },
        isPublic: { type: Boolean, default: false }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true })


const Member = models.Member || model("Member", UserSchema);

export default Member;