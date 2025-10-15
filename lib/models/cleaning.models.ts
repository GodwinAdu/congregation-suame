import mongoose, { Schema, Document } from "mongoose";

export interface ICleaningTask extends Document {
    area: string;
    task: string;
    frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
    assignedTo?: mongoose.Types.ObjectId;
    dueDate: Date;
    completedDate?: Date;
    status: "Pending" | "In Progress" | "Completed" | "Overdue";
    priority: "Low" | "Medium" | "High";
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const CleaningTaskSchema: Schema<ICleaningTask> = new Schema(
    {
        area: { type: String, required: true },
        task: { type: String, required: true },
        frequency: {
            type: String,
            enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
            required: true
        },
        assignedTo: { type: Schema.Types.ObjectId, ref: "Member" },
        dueDate: { type: Date, required: true },
        completedDate: { type: Date },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed", "Overdue"],
            default: "Pending"
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        notes: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true }
    },
    { timestamps: true }
);

export interface IInventoryItem extends Document {
    name: string;
    category: "Cleaning Supplies" | "Audio/Visual" | "Literature" | "Furniture" | "Maintenance" | "Other";
    quantity: number;
    unit: string;
    minQuantity: number;
    location: string;
    supplier?: string;
    cost?: number;
    lastRestocked?: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const InventoryItemSchema: Schema<IInventoryItem> = new Schema(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ["Cleaning Supplies", "Audio/Visual", "Literature", "Furniture", "Maintenance", "Other"],
            required: true
        },
        quantity: { type: Number, required: true, default: 0 },
        unit: { type: String, required: true },
        minQuantity: { type: Number, required: true, default: 1 },
        location: { type: String, required: true },
        supplier: { type: String },
        cost: { type: Number },
        lastRestocked: { type: Date },
        notes: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: "Member", required: true }
    },
    { timestamps: true }
);

export const CleaningTask = mongoose.models.CleaningTask ||
    mongoose.model<ICleaningTask>("CleaningTask", CleaningTaskSchema);

export const InventoryItem = mongoose.models.InventoryItem ||
    mongoose.model<IInventoryItem>("InventoryItem", InventoryItemSchema);