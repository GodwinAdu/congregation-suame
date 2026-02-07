import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  description: string;
  amount: number;
  category: 'maintenance' | 'utilities' | 'literature' | 'assembly' | 'equipment' | 'other';
  requestedBy: mongoose.Types.ObjectId;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvals: Array<{
    approverId: mongoose.Types.ObjectId;
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    date?: Date;
    comments?: string;
  }>;
  currentApprovalLevel: number;
  receiptUrl?: string;
  paidDate?: Date;
  budgetCategory?: string;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ['maintenance', 'utilities', 'literature', 'assembly', 'equipment', 'other'],
      required: true 
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    requestDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending' 
    },
    approvals: [{
      approverId: { type: Schema.Types.ObjectId, ref: 'Member' },
      level: Number,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      date: Date,
      comments: String
    }],
    currentApprovalLevel: { type: Number, default: 1 },
    receiptUrl: String,
    paidDate: Date,
    budgetCategory: String,
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

ExpenseSchema.index({ congregationId: 1, status: 1 });
ExpenseSchema.index({ congregationId: 1, requestedBy: 1 });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
