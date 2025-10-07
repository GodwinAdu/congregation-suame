import mongoose, { Schema, Document } from "mongoose";

export interface ITransportFee extends Document {
    name: string;
    description?: string;
    amount: number;
    isActive: boolean;
    dueDate?: Date;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMemberFeePayment extends Document {
    memberId: mongoose.Types.ObjectId;
    feeId: mongoose.Types.ObjectId;
    amountPaid: number;
    isPaid: boolean;
    balance: number;
    isJoined: boolean;
    paymentDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const TransportFeeSchema: Schema<ITransportFee> = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        amount: { type: Number, required: true, min: 0 },
        isActive: { type: Boolean, default: true },
        dueDate: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    },
    { timestamps: true }
);

const MemberFeePaymentSchema: Schema<IMemberFeePayment> = new Schema(
    {
        memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
        feeId: { type: Schema.Types.ObjectId, ref: "TransportFee", required: true },
        amountPaid: { type: Number, default: 0, min: 0 },
        isPaid: { type: Boolean, default: false },
        balance: { type: Number, default: 0, min: 0 },
        isJoined: { type: Boolean, default: false },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

// Compound index to ensure one payment record per member per fee
MemberFeePaymentSchema.index({ memberId: 1, feeId: 1 }, { unique: true });

export const TransportFee = mongoose.models.TransportFee || mongoose.model<ITransportFee>("TransportFee", TransportFeeSchema);
export const MemberFeePayment = mongoose.models.MemberFeePayment || mongoose.model<IMemberFeePayment>("MemberFeePayment", MemberFeePaymentSchema);