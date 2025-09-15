import { model, models, Schema } from "mongoose";

const AttendanceSchema = new Schema({
    attendance: {
        type: Number,
        default: 0,
        required: true
    },
    month: {
        type: Number,
        default: new Date().getMonth() + 1,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    meetingType: {
        type: String,
        enum: ["Midweek", "Weekend"],
    },
    week: {
        type: Number,
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate meetingType and week
AttendanceSchema.pre('save', function (next) {
    const day = new Date(this.date).getDay();

    // Calculate meetingType
    if (day >= 2 && day <= 4) {
        this.meetingType = "Midweek";
    } else if (day === 6 || day === 0) {
        this.meetingType = "Weekend";
    } else {
        this.meetingType = "Midweek";
    }

    // Calculate week of the month (1-5)
    const date = new Date(this.date);
    const dayOfMonth = date.getDate();
    this.week = Math.ceil(dayOfMonth / 7);

    next();
});


const Attendance = models.Attendance ?? model("Attendance", AttendanceSchema);

export default Attendance;