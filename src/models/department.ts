import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDepartment {
    name: string;
}

const departmentSchema = new Schema<IDepartment>({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

const Department: Model<IDepartment> = mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
