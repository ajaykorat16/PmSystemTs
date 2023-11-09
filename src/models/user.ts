import mongoose, { Document, Model, Schema, Types } from 'mongoose';

enum Role {
    Admin = 'admin',
    User = 'user'
}

interface IProject {
    id: Types.ObjectId;
}

export interface IUser {
    employeeNumber: number;
    firstname: string;
    lastname: string;
    fullName: string;
    email: string;
    password: string;
    phone: number;
    address: string;
    dateOfBirth: Date;
    department: mongoose.Schema.Types.ObjectId;
    dateOfJoining: Date;
    status?: string;
    leaveBalance?: number;
    photo?: {
        data: Buffer | null;
        contentType: string | null;
    };
    role?: Role;
    carryForward?: number;
    projects?: IProject[];
}

const userSchema = new Schema<IUser>({
    employeeNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: 'Active',
    },
    leaveBalance: {
        type: Number,
        default: 0,
    },
    photo: {
        data: {
            type: Buffer,
            default: null,
        },
        contentType: {
            type: String,
            default: null,
        },
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.User,
    },
    carryForward: {
        type: Number,
        default: 0,
    },
    projects: [
        {
            id: {
                type: mongoose.Types.ObjectId,
                ref: 'Project',
            },
        },
    ],
}, {
    timestamps: true,
});

userSchema.pre('save', function (this: IUser, next) {
    this.fullName = this.firstname + ' ' + this.lastname;
    next();
});

const Users: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default Users;
