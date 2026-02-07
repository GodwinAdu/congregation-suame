import { model, models, Schema } from "mongoose";


const PrivilegeSchema = new Schema({
    name: { type: String, required: true, unique: true },
    excludeFromActivities: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "Member" }
}, { timestamps: true });


const Privilege = models.Privilege ?? model("Privilege", PrivilegeSchema);

export default Privilege;
