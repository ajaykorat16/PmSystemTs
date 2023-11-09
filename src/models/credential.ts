import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IUser {
    id: Types.ObjectId;
}

export interface ICredential {
    title: string;
    description: string;
    createdBy: Types.ObjectId | IUser;
    users: IUser[];
}

const credentialSchema = new Schema<ICredential>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },
    users: [
        {
            id: {
                type: Types.ObjectId,
                ref: "User",
            },
        },
    ],
}, {
    timestamps: true,
});

const Credential: Model<ICredential> = mongoose.model<ICredential>("Credential", credentialSchema);

export default Credential;