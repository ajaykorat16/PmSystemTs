import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IWorkLog {
    userId: mongoose.Schema.Types.ObjectId;
    project: mongoose.Schema.Types.ObjectId;
    description: string;
    logDate: Date;
    time: number;
}

const workLogSchema: Schema<IWorkLog> = new Schema<IWorkLog>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    logDate: {
        type: Date,
        required: true,
    },
    time: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

const Worklog: Model<IWorkLog> = mongoose.model<IWorkLog>("Worklog", workLogSchema);

export default Worklog;
