import mongoose, { Schema, Document } from 'mongoose';

export interface ILiterature extends Document {
  title: string;
  type: 'book' | 'brochure' | 'tract' | 'magazine' | 'video' | 'other';
  language: string;
  stockQuantity: number;
  reorderLevel: number;
  unitCost?: number;
  placements: Array<{
    memberId: mongoose.Types.ObjectId;
    quantity: number;
    date: Date;
    notes?: string;
  }>;
  contributions: Array<{
    amount: number;
    date: Date;
    notes?: string;
  }>;
  orders: Array<{
    quantity: number;
    orderDate: Date;
    receivedDate?: Date;
    cost?: number;
    status: 'pending' | 'received' | 'cancelled';
  }>;
  congregationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LiteratureSchema = new Schema<ILiterature>(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['book', 'brochure', 'tract', 'magazine', 'video', 'other'],
      required: true 
    },
    language: { type: String, required: true },
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    unitCost: { type: Number },
    placements: [{
      memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
      quantity: Number,
      date: Date,
      notes: String
    }],
    contributions: [{
      amount: Number,
      date: Date,
      notes: String
    }],
    orders: [{
      quantity: Number,
      orderDate: Date,
      receivedDate: Date,
      cost: Number,
      status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'pending' }
    }],
    congregationId: { type: Schema.Types.ObjectId, ref: 'Congregation', required: true }
  },
  { timestamps: true }
);

LiteratureSchema.index({ congregationId: 1, type: 1 });
LiteratureSchema.index({ congregationId: 1, stockQuantity: 1 });

export default mongoose.models.Literature || mongoose.model<ILiterature>('Literature', LiteratureSchema);
