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
        default:null
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
        default:null
    },
    dob: {
        type: Date,
        default:null
    },
    baptizedDate:{
        type:Date,
        default:null
    },
    address: {
        type: String,
        default:null
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default: "publisher",
    },
    privileges: [{ type: Schema.Types.ObjectId, ref: "Privilege", default:[] }],
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    transport: {
        carStatus: {
            type: Boolean,
            default: false
        },
        payed: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            default: 0
        },
        balance: {
            type: Number,
            default: 0
        },
        cardNumber: {
            type: Number,
            default: 0
        },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true })


const Member = models.Member || model("Member", UserSchema);

export default Member;