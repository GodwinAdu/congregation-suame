import { model, models, Schema } from "mongoose"

const ContributionSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['worldwide-work', 'local-congregation', 'kingdom-hall', 'circuit-assembly', 'other'],
        required: true 
    },
    method: { type: String, enum: ['cash', 'check', 'online', 'bank-transfer'], default: 'cash' },
    anonymous: { type: Boolean, default: false },
    receiptNumber: String,
    notes: String
}, { timestamps: true })

const ExpenseSchema = new Schema({
    category: { 
        type: String, 
        enum: ['utilities', 'maintenance', 'supplies', 'literature', 'assembly', 'other'],
        required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    paidTo: String,
    receiptUrl: String,
    status: { type: String, enum: ['pending', 'approved', 'paid'], default: 'pending' }
}, { timestamps: true })

const BudgetSchema = new Schema({
    year: { type: Number, required: true },
    categories: [{
        name: String,
        budgeted: Number,
        spent: { type: Number, default: 0 },
        remaining: { type: Number, default: 0 }
    }],
    totalBudget: Number,
    totalSpent: { type: Number, default: 0 }
}, { timestamps: true })

export const Contribution = models.Contribution || model("Contribution", ContributionSchema)
export const Expense = models.Expense || model("Expense", ExpenseSchema)
export const Budget = models.Budget || model("Budget", BudgetSchema)