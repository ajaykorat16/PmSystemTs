import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { capitalizeFLetter, formattedDate } from '../helper/helper';
import Projects, { IDeveloper, IProject } from '../models/projects';
import Users from '../models/user';
import Worklog from '../models/worklog';
import mongoose from 'mongoose';


const createProject = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, startDate, developers }: IProject = req.body;

        const projectObj = {
            name: capitalizeFLetter(name),
            description: capitalizeFLetter(description),
            startDate: startDate,
            developers,
        };

        const projectName = await Projects.findOne({ name: projectObj.name });
        if (projectName) {
            return res.status(200).json({
                error: true,
                message: "Project has already created.",
            });
        }

        const project = await Projects.create(projectObj);

        for (const developer of project.developers) {
            let id = developer.id;
            let projectId = project._id;
            await Users.findOneAndUpdate(
                { _id: id },
                {
                    $push: {
                        projects: {
                            id: projectId
                        }
                    }
                },
                { new: true }
            );
        }

        return res.status(201).json({
            error: false,
            message: "Project created successfully.",
            project,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getAllProjects = async (req: Request, res: Response) => {
    try {
        const getAllProjects: IProject[] = await Projects.find().lean();

        const formatteProject = getAllProjects.map((project) => {
            return {
                ...project,
                startDate: formattedDate(project.startDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "All projects retrieved successfully.",
            getAllProjects: formatteProject,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getProjects = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const sortField: string = req.query.sortField as string || "createdAt";
        const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
        const { filter } = req.body;

        let query = {};

        if (filter) {
            function isValidDate(filter: string) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch: Date | null;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            } else {
                dateSearch = null;
            }

            query = {
                $or: [
                    { name: { $regex: filter, $options: "i" } },
                    { description: { $regex: filter, $options: "i" } },
                    {
                        $expr: {
                            $eq: [{ $month: "$startDate" }, isNaN(filter) ? null : filter],
                        },
                    },
                    {
                        $expr: {
                            $eq: [{ $year: "$startDate" }, isNaN(filter) ? null : filter],
                        },
                    },
                    { startDate: { $eq: dateSearch } },
                ],
            };
        }
        const totalProjects: number = await Projects.countDocuments(query);
        const skip: number = (page - 1) * limit;
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

        let projects = await Projects.find(query).sort(sortOptions).skip(skip).limit(limit).populate({ path: "developers.id", select: "fullName", }).lean();
        const formatteProject = projects.map((project) => {
            return {
                ...project,
                startDate: formattedDate(project.startDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "Project retrieved successfully.",
            projects: formatteProject,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / limit),
            totalProjects,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getUserProjects = async (req: any, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const sortField: string = req.query.sortField as string || "createdAt";
        const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
        const userId: mongoose.Types.ObjectId = req.user._id
        const { filter } = req.body;

        let query: any = { "developers.id": userId };

        if (filter) {
            function isValidDate(filter: string) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            } else {
                dateSearch = null;
            }

            query.$or = [
                { name: { $regex: filter, $options: "i" } },
                { description: { $regex: filter, $options: "i" } },
                {
                    $expr: {
                        $eq: [{ $month: "$startDate" }, isNaN(filter) ? null : filter],
                    },
                },
                {
                    $expr: {
                        $eq: [{ $year: "$startDate" }, isNaN(filter) ? null : filter],
                    },
                },
                { startDate: { $eq: dateSearch } },
            ];
        }

        const totalProjectsCount: number = await Projects.countDocuments(query);
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;
        const matchingProjects = await Projects.find(query).skip((page - 1) * limit).limit(limit).sort(sortOptions).lean();

        const formattedProjects = matchingProjects.map((project) => ({
            ...project,
            startDate: formattedDate(project.startDate),
        }));

        return res.status(200).json({
            error: false,
            message: "Projects retrieved successfully.",
            projects: formattedProjects,
            currentPage: page,
            totalPages: Math.ceil(totalProjectsCount / limit),
            totalProjects: totalProjectsCount,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const updateProject = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, startDate, developers }: IProject = req.body;
        const id: string = req.params.id;

        const existingProject = await Projects.findById(id);
        if (!existingProject) {
            return res.status(404).json({
                error: true,
                message: "This project is not existing in the database.",
            });
        }

        const projectObj = {
            name: name ? capitalizeFLetter(name) : existingProject.name,
            description: description ? capitalizeFLetter(description) : existingProject.description,
            startDate: startDate || existingProject.startDate,
            developers: developers || existingProject.developers,
        };

        if (developers && Array.isArray(developers)) {
            const newdevelopersIds = developers.map((p: any): IDeveloper => {
                return { id: new mongoose.Types.ObjectId(p) };
            });
            projectObj.developers = newdevelopersIds;
        }

        const updatedProject = await Projects.findByIdAndUpdate(id, projectObj, { new: true, });

        for (const developerId of existingProject.developers) {
            await Users.findByIdAndUpdate(developerId.id, { $pull: { projects: { id: id } }, });
        }

        for (const developerId of developers) {
            await Users.findByIdAndUpdate(developerId, { $addToSet: { projects: { id: id } }, });
        }

        return res.status(200).json({
            error: false,
            message: "Project updated successfully.",
            project: updatedProject,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const getSingleProject = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const project = await Projects.findById(id).populate({ path: "developers.id", select: "-photo", });
        return res.status(200).json({
            error: false,
            message: "Single project getting successfully.",
            project,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const delelteProject = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const project = await Projects.findByIdAndDelete(id);
        if (project) {
            await Users.updateMany(
                {
                    projects:
                    {
                        $elemMatch: {
                            id: id
                        }
                    }
                },
                {
                    $pull: {
                        projects: {
                            id: id
                        }
                    }
                }
            );
            await Worklog.deleteMany({ project: id });
        }
        return res.status(200).json({
            error: false,
            message: "Project deleted successfully.",
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

const userProjects = async (req: any, res: Response) => {
    try {
        const id: mongoose.Types.ObjectId = req.user._id
        const project: IProject[] = await Projects.find({ "developers.id": id });
        return res.status(200).json({
            error: false,
            message: "Projects getting Successfully.",
            project,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

export { createProject, getAllProjects, getProjects, getUserProjects, updateProject, delelteProject, getSingleProject, userProjects };
