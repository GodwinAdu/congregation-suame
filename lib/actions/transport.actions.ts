"use server"

import { User, withAuth } from "../helpers/auth";
import Member from "../models/user.models";
import TransportConfig from "../models/transport-config.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _fetchAllMembersTransport(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const members = await Member.find({})
            .select('fullName transport')
            .sort({ fullName: 1 });

        return JSON.parse(JSON.stringify(members));
    } catch (error) {
        console.log("Error fetching members transport:", error);
        throw error;
    }
}

async function _updateMemberTransportStatus(user: User, memberId: string, carStatus: boolean) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const config = await TransportConfig.findOne({ isActive: true });
        const transportAmount = config?.transportAmount || 0;

        let cardNumber = 0;
        if (carStatus) {
            // Get the highest card number and increment
            const highestCard = await Member.findOne(
                { "transport.carStatus": true },
                { "transport.cardNumber": 1 }
            ).sort({ "transport.cardNumber": -1 });
            
            cardNumber = (highestCard?.transport?.cardNumber || 0) + 1;
        }

        const updatedMember = await Member.findByIdAndUpdate(
            memberId,
            { 
                "transport.carStatus": carStatus,
                "transport.payed": false,
                "transport.amount": 0,
                "transport.balance": carStatus ? transportAmount : 0,
                "transport.cardNumber": cardNumber
            },
            { new: true, runValidators: false }
        );

        if (!updatedMember) throw new Error("Member not found");
        
        await logActivity({
            userId: user._id,
            type: 'transport_status',
            action: `${user.fullName} ${carStatus ? 'enrolled' : 'removed'} ${updatedMember.fullName} in transport`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(updatedMember));
    } catch (error) {
        console.log("Error updating transport status:", error);
        throw error;
    }
}

async function _addPayment(user: User, memberId: string, paymentAmount: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const [member, config] = await Promise.all([
            Member.findById(memberId),
            TransportConfig.findOne({ isActive: true })
        ]);
        
        if (!member) throw new Error("Member not found");
        if (!config) throw new Error("Transport configuration not found");

        const currentAmount = member.transport.amount || 0;
        const maxPayment = config.transportAmount - currentAmount;
        
        if (paymentAmount > maxPayment) {
            throw new Error(`Payment exceeds remaining balance. Maximum allowed: ₵${maxPayment}`);
        }

        const newAmount = currentAmount + paymentAmount;
        const newBalance = Math.max(0, config.transportAmount - newAmount);
        const isPayed = newAmount >= config.transportAmount;

        const updatedMember = await Member.findByIdAndUpdate(
            memberId,
            { 
                "transport.amount": newAmount,
                "transport.balance": newBalance,
                "transport.payed": isPayed
            },
            { new: true, runValidators: false }
        );
        
        await logActivity({
            userId: user._id,
            type: 'transport_payment',
            action: `${user.fullName} recorded ₵${paymentAmount} transport payment for ${member.fullName}`,
            details: { entityId: memberId, entityType: 'Member' },
        });

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(updatedMember));
    } catch (error) {
        console.log("Error adding payment:", error);
        throw error;
    }
}

async function _setTransportAmount(user: User, memberId: string, totalAmount: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const member = await Member.findById(memberId);
        if (!member) throw new Error("Member not found");

        const currentPaid = member.transport.amount;
        const newBalance = Math.max(0, totalAmount - currentPaid);
        const isPayed = currentPaid >= totalAmount;

        const updatedMember = await Member.findByIdAndUpdate(
            memberId,
            { 
                "transport.balance": newBalance,
                "transport.payed": isPayed
            },
            { new: true, runValidators: false }
        );

        revalidatePath('/dashboard/transport');
        return JSON.parse(JSON.stringify(updatedMember));
    } catch (error) {
        console.log("Error setting transport amount:", error);
        throw error;
    }
}

async function _setGlobalTransportAmount(user: User, totalAmount: number) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Update or create transport config
        await TransportConfig.findOneAndUpdate(
            { isActive: true },
            { transportAmount: totalAmount, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        // Get all members with carStatus: true
        const participatingMembers = await Member.find({ "transport.carStatus": true });
        
        // Update all participating members
        const updatePromises = participatingMembers.map(member => {
            const currentPaid = member.transport.amount || 0;
            const newBalance = Math.max(0, totalAmount - currentPaid);
            const isPayed = currentPaid >= totalAmount;

            return Member.findByIdAndUpdate(
                member._id,
                { 
                    "transport.balance": newBalance,
                    "transport.payed": isPayed
                },
                { new: true, runValidators: false }
            );
        });

        await Promise.all(updatePromises);
        
        await logActivity({
            userId: user._id,
            type: 'transport_config',
            action: `${user.fullName} set global transport amount to ₵${totalAmount}`,
            details: { entityType: 'TransportConfig' },
        });

        revalidatePath('/dashboard/transport');
        return { success: true, updatedCount: participatingMembers.length };
    } catch (error) {
        console.log("Error setting global transport amount:", error);
        throw error;
    }
}

async function _getTransportConfig(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const config = await TransportConfig.findOne({ isActive: true });
        return config ? JSON.parse(JSON.stringify(config)) : null;
    } catch (error) {
        console.log("Error fetching transport config:", error);
        throw error;
    }
}

async function _resetAllTransportData(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        // Reset all members transport data
        await Member.updateMany(
            {},
            {
                "transport.carStatus": false,
                "transport.payed": false,
                "transport.amount": 0,
                "transport.balance": 0,
                "transport.cardNumber": 0
            },
            { runValidators: false }
        );

        // Delete transport config
        await TransportConfig.deleteMany({});
        
        await logActivity({
            userId: user._id,
            type: 'transport_reset',
            action: `${user.fullName} reset all transport data`,
            details: { entityType: 'TransportConfig' },
        });

        revalidatePath('/dashboard/transport');
        return { success: true, message: "All transport data has been reset" };
    } catch (error) {
        console.log("Error resetting transport data:", error);
        throw error;
    }
}

export const fetchAllMembersTransport = await withAuth(_fetchAllMembersTransport);
export const updateMemberTransportStatus = await withAuth(_updateMemberTransportStatus);
export const addPayment = await withAuth(_addPayment);
export const setTransportAmount = await withAuth(_setTransportAmount);
export const setGlobalTransportAmount = await withAuth(_setGlobalTransportAmount);
export const getTransportConfig = await withAuth(_getTransportConfig);
export const resetAllTransportData = await withAuth(_resetAllTransportData);