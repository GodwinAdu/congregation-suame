import { model, models, Schema } from "mongoose";


const GroupSchema = new Schema({
    name: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true })

const Group = models.Group ?? model("Group", GroupSchema)

export default Group;