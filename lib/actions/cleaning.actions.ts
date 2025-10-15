"use server"

import { User, withAuth } from "../helpers/auth";
import { CleaningTask, InventoryItem } from "../models/cleaning.models";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { logActivity } from "../utils/activity-logger";

async function _createCleaningTask(user: User, values: {
    area: string;
    task: string;
    frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
    assignedTo?: string;
    dueDate: Date;
    priority: "Low" | "Medium" | "High";
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newTask = new CleaningTask({
            ...values,
            createdBy: user._id
        });

        await newTask.save();

        await logActivity({
            userId: user._id as string,
            type: 'system_access',
            action: `${user.fullName} created cleaning task: ${values.task}`,
            details: { entityId: newTask._id, entityType: 'CleaningTask' },
        });

        revalidatePath('/dashboard/cleaning');
        return JSON.parse(JSON.stringify(newTask));

    } catch (error) {
        console.log("Error creating cleaning task:", error);
        throw error;
    }
}

async function _updateCleaningTask(user: User, id: string, values: {
    status?: "Pending" | "In Progress" | "Completed" | "Overdue";
    assignedTo?: string;
    completedDate?: Date;
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedTask = await CleaningTask.findByIdAndUpdate(
            id,
            values,
            { new: true, runValidators: false }
        );

        if (!updatedTask) throw new Error("Task not found");

        await logActivity({
            userId: user._id as string,
            type: 'system_access',
            action: `${user.fullName} updated cleaning task`,
            details: { entityId: id, entityType: 'CleaningTask' },
        });

        revalidatePath('/dashboard/cleaning');
        return JSON.parse(JSON.stringify(updatedTask));
    } catch (error) {
        console.log("Error updating cleaning task:", error);
        throw error;
    }
}

async function _fetchCleaningTasks(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const tasks = await CleaningTask.find({})
            .populate('assignedTo', 'fullName')
            .populate('createdBy', 'fullName')
            .sort({ dueDate: 1 });

        return JSON.parse(JSON.stringify(tasks));
    } catch (error) {
        console.log("Error fetching cleaning tasks:", error);
        throw error;
    }
}

async function _createInventoryItem(user: User, values: {
    name: string;
    category: "Cleaning Supplies" | "Audio/Visual" | "Literature" | "Furniture" | "Maintenance" | "Other";
    quantity: number;
    unit: string;
    minQuantity: number;
    location: string;
    supplier?: string;
    cost?: number;
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const newItem = new InventoryItem({
            ...values,
            createdBy: user._id
        });

        await newItem.save();

        await logActivity({
            userId: user._id as string,
            type: 'system_access',
            action: `${user.fullName} added inventory item: ${values.name}`,
            details: { entityId: newItem._id, entityType: 'InventoryItem' },
        });

        revalidatePath('/dashboard/cleaning');
        return JSON.parse(JSON.stringify(newItem));

    } catch (error) {
        console.log("Error creating inventory item:", error);
        throw error;
    }
}

async function _updateInventoryItem(user: User, id: string, values: {
    quantity?: number;
    location?: string;
    supplier?: string;
    cost?: number;
    lastRestocked?: Date;
    notes?: string;
}) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            id,
            values,
            { new: true, runValidators: false }
        );

        if (!updatedItem) throw new Error("Item not found");

        await logActivity({
            userId: user._id as string,
            type: 'system_access',
            action: `${user.fullName} updated inventory item`,
            details: { entityId: id, entityType: 'InventoryItem' },
        });

        revalidatePath('/dashboard/cleaning');
        return JSON.parse(JSON.stringify(updatedItem));
    } catch (error) {
        console.log("Error updating inventory item:", error);
        throw error;
    }
}

async function _fetchInventoryItems(user: User) {
    try {
        if (!user) throw new Error("User not authorized");

        await connectToDB();

        const items = await InventoryItem.find({})
            .populate('createdBy', 'fullName')
            .sort({ category: 1, name: 1 });

        return JSON.parse(JSON.stringify(items));
    } catch (error) {
        console.log("Error fetching inventory items:", error);
        throw error;
    }
}

export const createCleaningTask = await withAuth(_createCleaningTask);
export const updateCleaningTask = await withAuth(_updateCleaningTask);
export const fetchCleaningTasks = await withAuth(_fetchCleaningTasks);
export const createInventoryItem = await withAuth(_createInventoryItem);
export const updateInventoryItem = await withAuth(_updateInventoryItem);
export const fetchInventoryItems = await withAuth(_fetchInventoryItems);