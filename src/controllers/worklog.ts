import { Request, Response } from "express";
import Worklog, { IWorkLog } from "../models/worklog";
import Projects from "../models/projects";
import { validationResult } from 'express-validator';
import { capitalizeFLetter, formattedDate } from "../helper/helper";
import mongoose from "mongoose";
import moment from "moment";

export const createWorkLog = async (req: any, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { project, description, logDate, time }: IWorkLog = req.body;

        const userId: mongoose.Types.ObjectId = req.user._id

        const worklogObj = {
            userId,
            project,
            description: capitalizeFLetter(description),
            logDate,
            time
        };

        const worklog = await Worklog.create(worklogObj);

        return res.status(201).json({
            error: false,
            message: "Worklog created successfully.",
            worklog
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    };
}

async function generateWorklogQuery(filter: {
    project?: string;
    userId?: string;
    description?: string;
    logDate?: string;
}): Promise<{ [key: string]: any }> {
    return new Promise(async (resolve, reject) => {
        const query: { [key: string]: any } = {};

        if (filter.project) {
            query.project = filter.project;
        }

        if (filter.userId) {
            query.userId = filter.userId;
        }

        if (filter.description) {
            query.description = { $regex: filter.description, $options: "i" };
        }

        if (filter.logDate) {
            const dateSearch = new Date(filter.logDate);
            dateSearch.setMinutes(dateSearch.getMinutes() - dateSearch.getTimezoneOffset());
            query.logDate = dateSearch.toISOString();
        }
        resolve(query);
    });
}

export const userGetWorklog = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const sortField: string = req.query.sortField as string || 'createdAt';
        const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
        const userId: mongoose.Types.ObjectId = req.user._id;
        const { filter }: { filter?: string } = req.body;

        let query: any = { userId };

        if (filter) {
            function isValidDate(filter: string): boolean {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch: Date | null = null;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            }

            let projects: string[] = [];
            let searchProjects = await Projects.find({ name: { $regex: filter, $options: 'i' } });
            if (searchProjects.length !== 0) {
                projects = searchProjects.map((d: any) => d._id);
            }

            query.$or = [
                { description: { $regex: filter, $options: "i" } },
                { project: { $in: projects } },
                { logDate: dateSearch },
            ]
        }

        const totalWorklogCount: number = await Worklog.countDocuments(query);
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

        const worklog = await Worklog.find(query)
            .populate({ path: "project", select: "name" })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortOptions)
            .lean();

        const formattedWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });

        const currentWeekStart = moment().startOf('week');
        const dayWiseTotals: { [day: string]: number } = {};

        formattedWorklog.forEach((log) => {
            const logDate = moment(log.logDate, "DD-MM-YYYY");
            if (logDate.isBetween(currentWeekStart, moment(), undefined, '[]')) {
                const day = logDate.format("dddd");
                if (!dayWiseTotals[day]) {
                    dayWiseTotals[day] = 0;
                }
                dayWiseTotals[day] += log.time;
            }
        });

        const totalWeekTime: number = Object.values(dayWiseTotals).reduce((total, dayTime) => {
            return total + dayTime;
        }, 0);

        return res.status(200).json({
            error: false,
            message: "Worklog getting successfully.",
            dayWiseTotals,
            totalWeekTime,
            worklog: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}

export const getAllWorklog = async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const sortField: string = req.query.sortField as string | any || 'createdAt';
        const sortOrder: number = parseInt(req.query.sortOrder as string | any) || -1;
        const filter: any = req.body.filter; // Assuming filter can be of any type
        const yesterday = moment().subtract(1, 'days').startOf('day');
        let query: any = {};

        if (typeof filter !== 'undefined') {
            query = await generateWorklogQuery(filter);
        }

        const workLogQuery = {
            logDate: {
                $gte: yesterday.toDate(),
                $lt: moment(yesterday).endOf('day').toDate()
            }
        };

        const userCountPipeline = [
            {
                $match: workLogQuery
            },
            {
                $group: {
                    _id: "$userId",
                }
            },
            {
                $group: {
                    _id: null,
                    userCount: { $sum: 1 }
                }
            }
        ];

        const userCountResult = await Worklog.aggregate(userCountPipeline);
        const worklogUserCount = userCountResult.length > 0 ? userCountResult[0].userCount : 0;

        const totalWorklogCount: number = await Worklog.countDocuments(query);
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

        const worklog = await Worklog.find(query)
            .populate({ path: "userId", select: "fullName" })
            .populate({ path: "project", select: "name" })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortOptions)
            .lean();

        const formattedWorklog = worklog.map((log: any) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "All Worklogs getting successfully.",
            worklog: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
            worklogUserCount
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const getSingleWorklog = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id: string = req.params.id;
        const worklog = await Worklog.findById({ _id: id })
            .populate({ path: "userId", select: "fullName" })
            .populate({ path: "project", select: "name" });

        return res.status(200).json({
            error: false,
            message: "Single worklog getting successfully.",
            worklog
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
}


export const updateWorklog = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id: string = req.params.id;
        const { project, description, logDate, time }: IWorkLog = req.body;

        const worklog: IWorkLog | null = await Worklog.findById({ _id: id });
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            });
        }

        const updatedFields = {
            project: project || worklog.project,
            description: capitalizeFLetter(description) || worklog.description,
            logDate: logDate || worklog.logDate,
            time: time || worklog.time
        };

        const updatedWorklog = await Worklog.findByIdAndUpdate(id, updatedFields, { new: true })

        return res.status(200).json({
            error: false,
            message: "Worklog updated successfully.",
            worklog: updatedWorklog
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};


export const deleteWorklog = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id: string = req.params.id;

        const worklog = await Worklog.findById(id);
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            });
        }

        await Worklog.findByIdAndDelete(id);
        return res.status(200).json({
            error: false,
            message: "Worklog deleted successfully.",
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};


