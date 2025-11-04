import mongoose from 'mongoose';

const fieldServiceMeetingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    conductor: {
        memberId: String,
        memberName: String
    },
    information: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

fieldServiceMeetingSchema.index({ date: 1 }, { unique: true });

const FieldServiceMeeting = mongoose.models.FieldServiceMeeting || mongoose.model('FieldServiceMeeting', fieldServiceMeetingSchema);

export default FieldServiceMeeting;