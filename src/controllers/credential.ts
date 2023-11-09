import { Request, Response } from 'express';
import Credential from '../models/credential';
import { validationResult } from 'express-validator';
import { capitalizeFLetter } from '../helper/helper';
import mongoose from 'mongoose';
import { ICredential } from '../models/credential';

const createCredential = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, users }: ICredential = req.body;
        const createdBy: mongoose.Types.ObjectId = req.user._id;

        const credentialObj: any = {
            title: capitalizeFLetter(title),
            description: capitalizeFLetter(description),
            createdBy,
            users: users,
        };

        const credential = await Credential.create(credentialObj);
        return res.status(201).json({
            error: false,
            message: "Credential created successfully.",
            credential,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getCredential = async (req: any, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const sortField: string = req.query.sortField as string || "createdAt";
        const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
        const { filter } = req.body;
        const userId: mongoose.Types.ObjectId = req.user._id

        let query: any = {
            $or: [
                { "users.id": userId },
                { createdBy: userId }
            ]
        };

        if (filter) {
            query.$or = [
                { title: { $regex: filter, $options: "i" } },
                { description: { $regex: filter, $options: "i" } }
            ];
        }

        const totalCredentialCount: number = await Credential.countDocuments(query);
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

        const credential = await Credential.find(query).skip((page - 1) * limit).limit(limit).sort(sortOptions).populate({ path: "users.id", select: "fullName", }).populate({ path: "createdBy", select: "fullName" }).lean();
        return res.status(201).json({
            error: false,
            message: "Credential is getting successfully.",
            credential,
            currentPage: page,
            totalPages: Math.ceil(totalCredentialCount / limit),
            totalCredential: totalCredentialCount,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getSingleCredential = async (req: any, res: Response) => {
    try {
        const id: string = req.params.id;

        const credential: any = await Credential.findById(id).populate({ path: "users.id createdBy" }).lean();

        const photoUrl = credential.users.map((user: any) => {
            if (user.id.photo && user.id.photo.contentType) {
                return `data:${user.id.photo.contentType};base64,${user.id.photo.data.toString("base64")}`;
            }
            return null;
        });

        const createdByUser = credential.createdBy;

        const createdByPhotoUrl = createdByUser && createdByUser.photo && createdByUser.photo.data
            ? `data:${createdByUser.photo.contentType};base64,${createdByUser.photo.data.toString("base64")}`
            : null;

        return res.status(200).json({
            error: false,
            message: "Single credential is getting successfully.",
            credential: {
                ...credential,
                users: credential.users.map((user: any) => ({
                    ...user,
                    photo: photoUrl[user.id]
                }))
            },
            createdBy: {
                ...createdByUser,
                photo: createdByPhotoUrl,
            },
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const updateCredential = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, users } = req.body;
        const id: string = req.params.id;

        const existingCredential = await Credential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({
                error: true,
                message: "This credential is not existing in the database.",
            });
        }

        const credentialObj = {
            title: title ? capitalizeFLetter(title) : existingCredential.title,
            description: description ? capitalizeFLetter(description) : existingCredential.description,
            users: users || existingCredential.users,
        };

        if (users && Array.isArray(users)) {
            const newUserIds = users.map((p: any): any => {
                return { id: new mongoose.Types.ObjectId(p) };
            });
            credentialObj.users = newUserIds;
        }

        if (existingCredential.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: true,
                message: "You are not authorized to Update this credential.",
            });
        }

        const updatedCredential = await Credential.findByIdAndUpdate(id, credentialObj, { new: true, });

        return res.status(200).json({
            error: false,
            message: "Credential updated successfully.",
            credential: updatedCredential,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const deleteCredential = async (req: any, res: Response) => {
    try {
        const id: string = req.params.id;

        const existingCredential = await Credential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({
                error: true,
                message: "This credential is not existing in the database.",
            });
        }

        if (existingCredential.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: true,
                message: "You are not authorized to delete this credential.",
            });
        }

        await Credential.findByIdAndDelete(id);

        return res.status(200).json({
            error: false,
            message: "Credential deleted successfully.",
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

export { createCredential, getCredential, getSingleCredential, updateCredential, deleteCredential };
