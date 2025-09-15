import { model, Schema, models, Model } from 'mongoose';

interface ITrash {
    originalCollection: string;
    document: Record<string, unknown>;
    message?: string;
    deletedBy?: Schema.Types.ObjectId;
    deletedAt?: Date;
    autoDelete?: boolean;
}

const trashSchema: Schema<ITrash> = new Schema({
    originalCollection: { type: String, required: true },
    document: { type: Schema.Types.Mixed, required: true },
    message: { type: String },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'Member' },
    deletedAt: { type: Date, default: Date.now },
    autoDelete: { type: Boolean, default: false }, // Defaults will be set dynamically
}, {
    timestamps: true,
    versionKey: false,
});

// TTL index applies only to documents where autoDelete is true
trashSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000, partialFilterExpression: { autoDelete: true } });

type TrashModel = Model<ITrash>;
const Trash: TrashModel = models.Trash || model<ITrash>('Trash', trashSchema);

export default Trash;