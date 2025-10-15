import { model, models, Schema } from "mongoose"

const TerritorySchema = new Schema({
    number: { type: String, required: true, unique: true },
    name: String,
    type: { type: String, enum: ['residential', 'business', 'rural', 'foreign'], default: 'residential' },
    boundaries: {
        type: { type: String, enum: ['Polygon'], default: 'Polygon' },
        coordinates: [[[Number]]]
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Member" },
    assignedDate: Date,
    lastWorked: Date,
    status: { type: String, enum: ['available', 'assigned', 'completed', 'do-not-call'], default: 'available' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    notes: String,
    addresses: [{
        street: String,
        number: String,
        apartment: String,
        status: { type: String, enum: ['not-worked', 'not-home', 'do-not-call', 'interested', 'study'], default: 'not-worked' },
        lastVisited: Date,
        notes: String,
        language: String
    }]
}, { timestamps: true })

const ReturnVisitSchema = new Schema({
    territoryId: { type: Schema.Types.ObjectId, ref: "Territory", required: true },
    publisherId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    address: String,
    personName: String,
    phoneNumber: String,
    email: String,
    interest: String,
    nextVisitDate: Date,
    status: { type: String, enum: ['active', 'study', 'inactive', 'moved'], default: 'active' },
    visits: [{
        date: { type: Date, default: Date.now },
        notes: String,
        literature: String,
        duration: Number
    }]
}, { timestamps: true })

export const Territory = models.Territory || model("Territory", TerritorySchema)
export const ReturnVisit = models.ReturnVisit || model("ReturnVisit", ReturnVisitSchema)