import mongoose from 'mongoose'

const dutySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'midweek_meeting',
            'weekend_meeting', 
            'field_service',
            'administrative',
            'special_events'
        ]
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        gender: {
            type: String,
            enum: ['male', 'female', 'both'],
            default: 'both'
        },
        privileges: [{
            type: String
        }],
        minimumAge: {
            type: Number,
            default: 0
        },
        baptized: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const memberDutySchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dutyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Duty',
        required: true
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Compound index to prevent duplicate assignments
memberDutySchema.index({ memberId: 1, dutyId: 1 }, { unique: true })

export const Duty = mongoose.models.Duty || mongoose.model('Duty', dutySchema)
export const MemberDuty = mongoose.models.MemberDuty || mongoose.model('MemberDuty', memberDutySchema)