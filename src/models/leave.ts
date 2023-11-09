import mongoose, { Document, Schema, Model, Types } from "mongoose";

enum LeaveStatus {
    Pending = "pending",
    Approved = "approved",
    Rejected = "rejected",
}

enum LeaveType {
    Paid = "paid",
    LWP = "lwp",
}

enum LeaveDayType {
    Single = "single",
    Multiple = "multiple",
    FirstHalf = "first_half",
    SecondHalf = "second_half",
}

export interface ILeave {
    userId: mongoose.Schema.Types.ObjectId;
    reason: string;
    reasonForLeaveReject?: string | null;
    startDate: Date;
    endDate: Date;
    status: LeaveStatus;
    leaveType: LeaveType;
    leaveDayType: LeaveDayType;
    totalDays: number;
}

const leaveSchema: Schema<ILeave> = new Schema<ILeave>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    reasonForLeaveReject: {
        type: String,
        default: null,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(LeaveStatus),
        default: LeaveStatus.Pending,
    },
    leaveType: {
        type: String,
        enum: Object.values(LeaveType),
        default: LeaveType.LWP,
    },
    leaveDayType: {
        type: String,
        enum: Object.values(LeaveDayType),
        required: true,
    },
    totalDays: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const Leaves: Model<ILeave> = mongoose.model<ILeave>("Leave", leaveSchema);

export default Leaves;
