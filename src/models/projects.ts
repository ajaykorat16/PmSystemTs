import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IDeveloper {
    id: Types.ObjectId;
}

export interface IProject {
    name: string;
    description: string;
    startDate: Date;
    developers: IDeveloper[];
}

const projectSchema: Schema<IProject> = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        developers: [
            {
                id: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Projects: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Projects;
