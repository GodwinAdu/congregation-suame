import mongoose from "mongoose";

const transportConfigSchema = new mongoose.Schema({
    transportAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

transportConfigSchema.pre('save', function(next) {
    this.updatedAt = new Date();
});

const TransportConfig = mongoose.models.TransportConfig || mongoose.model("TransportConfig", transportConfigSchema);

export default TransportConfig;