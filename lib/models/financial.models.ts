import { model, models, Schema } from "mongoose"

const ContributionSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: "Member" },
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: [
            'worldwide-work', 
            'local-congregation-expenses', 
            'kingdom-hall-construction', 
            'circuit-assembly-expenses',
            'co-visit-expenses',
            'disaster-relief',
            'other'
        ],
        required: true 
    },
    method: { type: String, enum: ['cash', 'check', 'online', 'bank-transfer'], default: 'cash' },
    anonymous: { type: Boolean, default: false },
    receiptNumber: String,
    notes: String,
    meetingDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true }
}, { timestamps: true })

const ExpenseSchema = new Schema({
    category: { 
        type: String, 
        enum: [
            'utilities', 
            'maintenance', 
            'supplies', 
            'literature', 
            'assembly-expenses',
            'co-visit',
            'cleaning-supplies',
            'sound-equipment',
            'other'
        ],
        required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member" },
    paidTo: String,
    receiptUrl: String,
    invoiceNumber: String,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'approved', 'paid', 'rejected'], default: 'pending' },
    paymentDate: Date,
    notes: String
}, { timestamps: true })

const BudgetSchema = new Schema({
    year: { type: Number, required: true },
    month: { type: Number }, // For monthly budgets
    categories: [{
        name: String,
        budgeted: Number,
        spent: { type: Number, default: 0 },
        remaining: { type: Number, default: 0 },
        description: String
    }],
    totalBudget: Number,
    totalSpent: { type: Number, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    status: { type: String, enum: ['draft', 'approved', 'active'], default: 'draft' }
}, { timestamps: true })

// Opening Balance Schema
const OpeningBalanceSchema = new Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    amount: { type: Number, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    notes: String
}, { timestamps: true })

// Monthly Financial Report Schema
const MonthlyReportSchema = new Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    openingBalance: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    closingBalance: { type: Number, default: 0 },
    contributionBreakdown: {
        worldwideWork: { type: Number, default: 0 },
        localExpenses: { type: Number, default: 0 },
        kingdomHall: { type: Number, default: 0 },
        circuitAssembly: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    expenseBreakdown: {
        utilities: { type: Number, default: 0 },
        maintenance: { type: Number, default: 0 },
        supplies: { type: Number, default: 0 },
        literature: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    preparedBy: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Member" },
    status: { type: String, enum: ['draft', 'submitted', 'approved'], default: 'draft' }
}, { timestamps: true })

export const Contribution = models.Contribution || model("Contribution", ContributionSchema)
export const Expense = models.Expense || model("Expense", ExpenseSchema)
export const Budget = models.Budget || model("Budget", BudgetSchema)
export const MonthlyReport = models.MonthlyReport || model("MonthlyReport", MonthlyReportSchema)
export const OpeningBalance = models.OpeningBalance || model("OpeningBalance", OpeningBalanceSchema)