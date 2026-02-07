"use server"

import mongoose from "mongoose";
import { User, withAuth } from "../helpers/auth";
import { TransportFee, MemberFeePayment } from "../models/transport-fee.models";
import Member from "../models/user.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createTransportFee(user: User, values: {
    name: string;
    description?: string;
    amount: number;
    dueDate?: Date;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newFee = new TransportFee({
            name: values.name,
            description: values.description,
            amount: values.amount,
            dueDate: values.dueDate,
            createdBy: user._id,
        });

        await newFee.save();

        // Create payment records for all members (not joined by default)
        const members = await Member.find({}).select('_id');
        const paymentRecords = members.map(member => ({
            memberId: member._id,
            feeId: newFee._id,
            amountPaid: 0,
            isPaid: false,
            balance: 0,
            isJoined: false,
        }));

        await MemberFeePayment.insertMany(paymentRecords);

        await logActivity({
            userId: user._id as string,
            type: 'transport_fee_create',
            action: `${user.fullName} created transport fee: ${values.name}`,
            details: { entityId: newFee._id, entityType: 'TransportFee' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(newFee));
    } catch (error) {
        console.log("Error creating transport fee:", error);
        throw error;
    }
}

async function _fetchAllTransportFees(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const fees = await TransportFee.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        return JSON.parse(JSON.stringify(fees));
    } catch (error) {
        console.log("Error fetching transport fees:", error);
        throw error;
    }
}

async function _fetchMembersWithFeeStatus(user: User, feeId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const fee = await TransportFee.findById(feeId);
        if (!fee) throw new Error("Fee not found");

        const membersWithPayments = await Member.aggregate([
            {
                $lookup: {
                    from: 'memberfeepayments',
                    let: { memberId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$memberId', '$$memberId'] },
                                        { $eq: ['$feeId', new mongoose.Types.ObjectId(feeId)] },
                                        { $eq: ['$isJoined', true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'payment'
                }
            },
            {
                $addFields: {
                    payment: { $arrayElemAt: ['$payment', 0] },
                    amountPaid: { $ifNull: [{ $arrayElemAt: ['$payment.amountPaid', 0] }, 0] },
                    isPaid: { $ifNull: [{ $arrayElemAt: ['$payment.isPaid', 0] }, false] },
                    balance: { $ifNull: [{ $arrayElemAt: ['$payment.balance', 0] }, 0] },
                    isJoined: { $ifNull: [{ $arrayElemAt: ['$payment.isJoined', 0] }, false] }
                }
            },
            {
                $project: {
                    fullName: 1,
                    amountPaid: 1,
                    isPaid: 1,
                    balance: 1,
                    paymentDate: '$payment.paymentDate',
                    isJoined: 1
                }
            },
            { $sort: { fullName: 1 } }
        ]);

        return JSON.parse(JSON.stringify({ fee, members: membersWithPayments }));
    } catch (error) {
        console.log("Error fetching members with fee status:", error);
        throw error;
    }
}

async function _addFeePayment(user: User, memberId: string, feeId: string, paymentAmount: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const [member, fee] = await Promise.all([
            Member.findById(memberId),
            TransportFee.findById(feeId)
        ]);

        if (!member) throw new Error("Member not found");
        if (!fee) throw new Error("Fee not found");

        let payment = await MemberFeePayment.findOne({ memberId, feeId });
        
        if (!payment) {
            payment = new MemberFeePayment({
                memberId,
                feeId,
                amountPaid: 0,
                isPaid: false,
                balance: fee.amount
            });
        }

        const maxPayment = fee.amount - payment.amountPaid;
        if (paymentAmount > maxPayment) {
            throw new Error(`Payment exceeds remaining balance. Maximum allowed: ₵${maxPayment}`);
        }

        payment.amountPaid += paymentAmount;
        payment.balance = Math.max(0, fee.amount - payment.amountPaid);
        payment.isPaid = payment.amountPaid >= fee.amount;
        payment.paymentDate = new Date();

        await payment.save();

        await logActivity({
            userId: user._id as string,
            type: 'transport_payment',
            action: `${user.fullName} recorded ₵${paymentAmount} payment for ${member.fullName} - ${fee.name}`,
            details: { entityId: payment._id, entityType: 'MemberFeePayment' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(payment));
    } catch (error) {
        console.log("Error adding fee payment:", error);
        throw error;
    }
}

async function _updateTransportFee(user: User, feeId: string, values: {
    name?: string;
    description?: string;
    amount?: number;
    dueDate?: Date;
    isActive?: boolean;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedFee = await TransportFee.findByIdAndUpdate(
            feeId,
            values,
            { new: true, runValidators: false }
        );

        if (!updatedFee) throw new Error("Fee not found");

        // If amount changed, update all payment balances
        if (values.amount !== undefined) {
            await MemberFeePayment.updateMany(
                { feeId },
                [
                    {
                        $set: {
                            balance: { $max: [0, { $subtract: [values.amount, "$amountPaid"] }] },
                            isPaid: { $gte: ["$amountPaid", values.amount] }
                        }
                    }
                ]
            );
        }

        await logActivity({
            userId: user._id as string,
            type: 'transport_fee_update',
            action: `${user.fullName} updated transport fee: ${updatedFee.name}`,
            details: { entityId: feeId, entityType: 'TransportFee' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(updatedFee));
    } catch (error) {
        console.log("Error updating transport fee:", error);
        throw error;
    }
}

async function _deleteTransportFee(user: User, feeId: string) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const fee = await TransportFee.findById(feeId);
        if (!fee) throw new Error("Fee not found");

        // Delete all related payments
        await MemberFeePayment.deleteMany({ feeId });
        
        // Delete the fee
        await TransportFee.findByIdAndDelete(feeId);

        await logActivity({
            userId: user._id as string,
            type: 'transport_fee_delete',
            action: `${user.fullName} deleted transport fee: ${fee.name}`,
            details: { entityId: feeId, entityType: 'TransportFee' },
        });

        revalidatePath('/dashboard/transport');
        return { success: true };
    } catch (error) {
        console.log("Error deleting transport fee:", error);
        throw error;
    }
}

async function _toggleMemberJoinStatus(user: User, memberId: string, feeId: string, isJoined: boolean) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const [member, fee] = await Promise.all([
            Member.findById(memberId),
            TransportFee.findById(feeId)
        ]);

        if (!member) throw new Error("Member not found");
        if (!fee) throw new Error("Fee not found");

        let payment = await MemberFeePayment.findOne({ memberId, feeId });
        
        if (!payment) {
            payment = new MemberFeePayment({
                memberId,
                feeId,
                amountPaid: 0,
                isPaid: false,
                balance: isJoined ? fee.amount : 0,
                isJoined
            });
        } else {
            payment.isJoined = isJoined;
            payment.balance = isJoined ? fee.amount - payment.amountPaid : 0;
        }

        await payment.save();

        await logActivity({
            userId: user._id as string,
            type: 'transport_join_status',
            action: `${user.fullName} ${isJoined ? 'enrolled' : 'removed'} ${member.fullName} ${isJoined ? 'in' : 'from'} ${fee.name}`,
            details: { entityId: payment._id, entityType: 'MemberFeePayment' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(payment));
    } catch (error) {
        console.log("Error toggling member join status:", error);
        throw error;
    }
}


async function _resetAllTransportData(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Delete all transport fees and payments
        await Promise.all([
            TransportFee.deleteMany({}),
            MemberFeePayment.deleteMany({})
        ]);

        await logActivity({
            userId: user._id as string,
            type: 'transport_reset',
            action: `${user.fullName} reset all transport data`,
            details: { entityType: 'TransportFee' },
        });

        revalidatePath('/dashboard/transport');
        return { success: true };
    } catch (error) {
        console.log("Error resetting transport data:", error);
        throw error;
    }
}

export const createTransportFee = await withAuth(_createTransportFee);
export const fetchAllTransportFees = await withAuth(_fetchAllTransportFees);
export const fetchMembersWithFeeStatus = await withAuth(_fetchMembersWithFeeStatus);
export const addFeePayment = await withAuth(_addFeePayment);
export const updateTransportFee = await withAuth(_updateTransportFee);
export const deleteTransportFee = await withAuth(_deleteTransportFee);
export const toggleMemberJoinStatus = await withAuth(_toggleMemberJoinStatus);
export const resetAllTransportData = await withAuth(_resetAllTransportData);