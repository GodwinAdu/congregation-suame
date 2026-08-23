 import mongoose from 'mongoose';

const familySchema = new mongoose.Schema({
    familyName: {
        type: String,
        required: true
    },
    headOfFamily: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    members: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: true
        },
        relationship: {
            type: String,
            enum: ['father', 'mother', 'son', 'daughter', 'husband', 'wife', 'brother', 'sister', 'grandfather', 'grandmother', 'grandson', 'granddaughter', 'other'],
            required: true
        },
        isHead: {
            type: Boolean,
            default: false
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    }
}, {
    timestamps: true
});

const Family = mongoose.models.Family || mongoose.model('Family', familySchema);

export default Family;