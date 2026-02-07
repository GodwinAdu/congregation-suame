import { Document, model, Types } from "mongoose";
import { Schema, models } from "mongoose";

export interface IUser extends Document {
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
    alternatePhone: {
        type: String,
        default: null
    },
    emergencyContacts: [{
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, default: null },
        isPrimary: { type: Boolean, default: false }
    }],
    dob: {
        type: Date,
        default: null
    },
    baptizedDate: {
        type: Date,
        default: null
    },
    pioneerStatus: {
        type: String,
        enum: ['none', 'auxiliary', 'regular', 'special'],
        default: 'none'
    },
    pioneerStartDate: {
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
    medicalInfo: {
        bloodType: { type: String, default: null },
        allergies: { type: String, default: null },
        medications: { type: String, default: null },
        conditions: { type: String, default: null },
        noBloodCard: { type: Boolean, default: false },
        notes: { type: String, default: null }
    },
    servicePreferences: {
        availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
        preferredServiceTime: { type: String, enum: ['morning', 'afternoon', 'evening'], default: null },
        hasVehicle: { type: Boolean, default: false },
        canDrive: { type: Boolean, default: false },
        willingToConduct: { type: Boolean, default: false },
        languages: [{ type: String }]
    },
    accountStatus: {
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
        lastLogin: { type: Date, default: null },
        accountLockedUntil: { type: Date, default: null }
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
        assignments: { type: Boolean, default: true },
        announcements: { type: Boolean, default: true },
        emergencies: { type: Boolean, default: true }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true })


const Member = models.Member || model("Member", UserSchema);

export default Member;