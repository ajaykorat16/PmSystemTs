import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface ILeaveManagement {
    user: mongoose.Schema.Types.ObjectId;
    monthly: Date;
    leave: number;
}

const leaveManagementSchema: Schema<ILeaveManagement> = new Schema<ILeaveManagement>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    monthly: {
        type: Date,
        required: true,
        trim: true,
    },
    leave: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

const LeaveManagement: Model<ILeaveManagement> = mongoose.model<ILeaveManagement>("LeaveManagement", leaveManagementSchema);

export default LeaveManagement;

