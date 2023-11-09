import { Request, Response } from 'express';
import LeaveManagement from '../models/leaveManagement';
import Users from '../models/user';
import { validationResult } from 'express-validator';
import { parsedDate } from '../helper/helper';
import moment from 'moment';
import mongoose from 'mongoose';

const getLeavesMonthWise = async (req: Request, res: Response) => {
    try {
        const d: Date = new Date();
        let month: number = d.getMonth() + 1;
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const filter: any = req.body.filter || month;

        let query: any;
        if (filter) {
            query = {
                $or: [
                    {
                        $expr: {
                            $eq: [{ $month: '$monthly' }, isNaN(filter) ? null : filter],
                        },
                    },
                ],
            };
        }

        const totalLeaves: number = await LeaveManagement.countDocuments(query);
        const skip: number = (page - 1) * limit;

        const leaves = await LeaveManagement.find(query)
            .skip(skip)
            .limit(limit)
            .populate({ path: 'user', select: 'fullName' })
            .lean();

        return res.status(200).json({
            error: false,
            message: 'Leaves are getting successfully.',
            leaves,
            currentPage: page,
            totalPages: Math.ceil(totalLeaves / limit),
            totalLeaves,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getSingleLeave = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        const getLeave = await LeaveManagement.findById({ _id: id }).populate({
            path: 'user',
            select: 'fullName',
        });

        if (!getLeave) {
            return res.status(404).json({
                error: true,
                message: 'Manage Leave not found.',
            });
        }

        return res.status(200).json({
            error: false,
            message: 'Single leave is getting successfully.',
            getLeave,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const updateLeave = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const leave: number = req.body.leave;

        const getLeave = await LeaveManagement.findById(id)

        if (!getLeave) {
            return res.status(404).json({
                error: true,
                message: 'Leave record not found',
            });
        }

        const leaveChange = leave - getLeave.leave;

        const updatedLeave = await LeaveManagement.findByIdAndUpdate(id, { leave }, { new: true });

        await Users.findByIdAndUpdate(getLeave.user, { $inc: { leaveBalance: leaveChange } }, { new: true });

        return res.status(200).json({
            error: false,
            message: 'Manage leave updated successfully.',
            updatedLeave,
        });
    } catch (error: any) {
        console.error(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getUserLeaves = async (req: any, res: Response) => {
    try {
        const userId: mongoose.Types.ObjectId = req.user._id;

        const leaves = await LeaveManagement.find({ user: userId })
            .populate({ path: 'user', select: 'fullName' })
            .lean();

        return res.status(200).json({
            error: false,
            message: "User's Leaves getting successfully.",
            leaves,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const createManageLeave = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        const { user, monthly, leave }: { user: string, monthly: number, leave: number } = req.body;

        if (leave < 1) {
            return res.status(200).json({
                error: true,
                message: 'Leave value must be greater than and equal to 1.',
            });
        }

        const today: Date = new Date();
        const currentYear: number = today.getFullYear();
        const monthlyDate: string = moment(new Date(currentYear, monthly - 1, 1)).format('YYYY-MM-DD');

        const manageCreateLeave = await new LeaveManagement({ user, monthly: parsedDate(monthlyDate), leave }).save();
        await Users.findByIdAndUpdate(user, { $inc: { leaveBalance: leave } }, { new: true });

        return res.status(201).json({
            error: false,
            message: 'Manage leave created successfully.',
            manageLeave: manageCreateLeave,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

// Export route handlers
export { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves, createManageLeave, };
