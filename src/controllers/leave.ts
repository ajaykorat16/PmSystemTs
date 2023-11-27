import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Leave, { ILeave } from '../models/leave';
import { capitalizeFLetter, formatteDayType, formattedDate, parsedDayType, sendMailForLeaveRequest, sendMailForLeaveStatus } from '../helper/helper';
import Users from '../models/user';
import { FlattenMaps } from 'mongoose';

const createLeave = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { reason, startDate, endDate, leaveType, leaveDayType, userId, status, totalDays }: ILeave = req.body;

        if (startDate > endDate) {
            return res.status(200).json({
                error: true,
                message: "Please select proper date."
            })
        }

        let uId;
        if (userId) {
            uId = userId;
        } else {
            uId = req.user._id;
        }

        const user: any = await Users.findById({ _id: uId });

        let createLeaves: any;
        if (user.leaveBalance >= totalDays && leaveType === "paid" && user.leaveBalance !== 0) {
            createLeaves = await new Leave({
                userId: uId,
                reason,
                startDate: startDate,
                endDate: endDate,
                leaveType,
                leaveDayType: parsedDayType(leaveDayType),
                status,
                totalDays,
            }).save();
        } else if (leaveType === "lwp") {
            createLeaves = await new Leave({
                userId: uId,
                reason,
                startDate: startDate,
                endDate: endDate,
                leaveType,
                leaveDayType: parsedDayType(leaveDayType),
                status,
                totalDays,
            }).save();
        } else {
            return res.status(201).json({
                error: true,
                message: "Your leave balance is not enough to take paid leave!",
            });
        }

        await sendMailForLeaveRequest(createLeaves);

        if (status === "approved" && leaveType === "paid") {
            await Users.findByIdAndUpdate(uId, { $inc: { leaveBalance: -totalDays } }, { new: true });
            await sendMailForLeaveStatus(createLeaves, "-");
        }

        return res.status(201).json({
            error: false,
            message: "Leave Created Successfully !!",
            leave: createLeaves,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getAllLeaves = async (req: Request, res: Response) => {
    try {
        const leaves = await Leave.find().populate("userId").lean();
        const formattedLeaves = leaves.map((leave) => {
            return {
                ...leave,
                startDate: formattedDate(leave.startDate),
                endDate: formattedDate(leave.endDate),
            };
        });
        return res.status(200).json({
            error: false,
            message: "All Leaves getting successfully.",
            leaves: formattedLeaves,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getLeaves = async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const { filter }: { filter?: string } = req.body;
    const sortField: string = req.query.sortField as string || 'createdAt';
    const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
    let sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

    try {
        let query = {};
        if (filter) {
            let fullName: string[] = [];
            let searchUser = await Users.find({
                fullName: { $regex: filter, $options: "i" },
            });
            if (searchUser.length !== 0) {
                fullName = searchUser.map((u: any) => {
                    return u._id;
                });
            }
            query = {
                $or: [
                    { leaveType: { $regex: filter.toLowerCase() } },
                    { status: { $regex: filter.toLowerCase() } },
                    { userId: { $in: fullName } },
                ],
            };
        }

        const totalLeaves = await Leave.countDocuments(query);
        const skip = (page - 1) * limit;
        let leaves;

        if (sortField === "userId.fullName") {
            leaves = await Leave.find(query).populate({ path: "userId", select: "fullName" }).skip(skip).limit(limit).lean();
            leaves.sort((a: FlattenMaps<ILeave> & { userId: { fullName?: string } }, b: FlattenMaps<ILeave> & { userId: { fullName?: string } }) => {
                const nameA = a.userId?.fullName || "";
                const nameB = b.userId?.fullName || "";
                return sortOrder * nameA.localeCompare(nameB);
            });

        } else {
            leaves = await Leave.find(query).sort(sortOptions).skip(skip).limit(limit).populate({ path: "userId", select: "fullName" }).lean();
        }
        const formattedLeaves = leaves.map((leave) => {
            return {
                ...leave,
                leaveType: capitalizeFLetter(leave.leaveType),
                leaveDayType: formatteDayType(leave.leaveDayType),
                status: capitalizeFLetter(leave.status),
                startDate: formattedDate(leave.startDate),
                endDate: formattedDate(leave.endDate),
            };
        });
        return res.status(200).json({
            error: false,
            message: "Leaves is retrieved successfully.",
            leaves: formattedLeaves,
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

const userGetLeave = async (req: any, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const { filter }: { filter?: string } = req.body;
        const sortField: string = req.query.sortField as string || 'createdAt';
        const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;
        let query: any = { userId: req.user._id };

        if (filter) {
            query = {
                userId: req.user._id,
                $or: [
                    { leaveType: { $regex: filter.toLowerCase() } },
                    { status: { $regex: filter.toLowerCase() } },
                ],
            };
        }

        const totalLeaves = await Leave.countDocuments(query);
        const skip = (page - 1) * limit;

        const currentYear = new Date().getFullYear();
        const approvedLeaves = await Leave.find({
            userId: req.user._id,
            status: "approved",
        });
        let totalApprovedLeaveDays = 0;

        for (const leave of approvedLeaves) {
            if (new Date(leave.startDate).getFullYear() === currentYear) {
                totalApprovedLeaveDays += leave.totalDays;
            }
        }

        const leaves = await Leave.find({ ...query, userId: req.user._id }).sort(sortOptions).skip(skip).limit(limit).populate({ path: "userId", select: "fullName" }).lean();

        const formattedLeaves = leaves.map((leave) => {
            return {
                ...leave,
                leaveType: capitalizeFLetter(leave.leaveType),
                leaveDayType: formatteDayType(leave.leaveDayType),
                status: capitalizeFLetter(leave.status),
                startDate: formattedDate(leave.startDate),
                endDate: formattedDate(leave.endDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "All Leaves getting successfully.",
            leaves: formattedLeaves,
            currentPage: page,
            totalPages: Math.ceil(totalLeaves / limit),
            totalLeaves,
            approvedLeave: totalApprovedLeaveDays,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getLeaveById = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const leaves = await Leave.findById({ _id: id }).populate("userId").lean();

        if (!leaves) {
            return res.status(404).json({
                error: true,
                message: "Leave not found."
            })
        }

        return res.status(200).json({
            error: false,
            message: "Single Leave getting successfully !!",
            leaves: {
                ...leaves,
                leaveDayType: formatteDayType(leaves?.leaveDayType || ""),
                startDate: leaves?.startDate.toISOString().split("T")[0],
                endDate: leaves?.endDate.toISOString().split("T")[0],
            },
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
        const { reason, startDate, endDate, leaveType, leaveDayType, status, userId, totalDays }: ILeave = req.body;
        const id: string = req.params.id;

        if (startDate > endDate) {
            return res.status(200).json({
                error: true,
                message: "Please select proper date."
            })
        }
        const userLeave = await Leave.findOne({ _id: id });

        const updatedFields: any = {
            userId: userId || userLeave?.userId,
            reason: reason || userLeave?.reason,
            status: status || userLeave?.status,
            startDate: startDate || userLeave?.startDate,
            endDate: endDate || userLeave?.endDate,
            leaveType: leaveType || userLeave?.leaveType,
            leaveDayType: parsedDayType(leaveDayType || "") || userLeave?.leaveDayType,
            totalDays: totalDays || userLeave?.totalDays,
        };

        const user: any = await Users.findById({ _id: updatedFields.userId }).select("-photo");

        let updateLeave: any;
        if (user.leaveBalance >= updatedFields.totalDays && updatedFields.leaveType === "paid" && user.leaveBalance !== 0) {
            updateLeave = await Leave.findByIdAndUpdate({ _id: userLeave?._id }, updatedFields, { new: true });
        } else if (updatedFields.leaveType === "lwp") {
            updateLeave = await Leave.findByIdAndUpdate({ _id: userLeave?._id }, updatedFields, { new: true });
        } else {
            return res.status(201).json({
                error: true,
                message: "Your leave balence is not enough to take paid leave!",
            });
        }

        return res.status(201).send({
            error: false,
            message: "Leave updated successfully.",
            leave: updateLeave,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const updateStatus = async (req: Request, res: Response) => {
    try {
        const { status, reasonForLeaveReject }: {
            status: string,
            reasonForLeaveReject: string
        } = req.body;
        const id: string = req.params.id;

        let updateLeave: any;
        if (status === "rejected") {
            updateLeave = await Leave.findByIdAndUpdate({ _id: id }, { status, reasonForLeaveReject }, { new: true });
            await sendMailForLeaveStatus(updateLeave, reasonForLeaveReject);
        }

        if (status === "approved") {
            updateLeave = await Leave.findByIdAndUpdate({ _id: id }, { status }, { new: true });
            await sendMailForLeaveStatus(updateLeave, "-");
        }

        if (updateLeave?.status === "approved" && updateLeave.leaveType === "paid") {
            await Users.findByIdAndUpdate(updateLeave.userId, { $inc: { leaveBalance: -updateLeave.totalDays } }, { new: true });
        }

        return res.status(201).send({
            error: false,
            message: "Status updated successfully.",
            leave: updateLeave,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const deleteLeave = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;

        await Leave.findByIdAndDelete({ _id: id });
        return res.status(201).send({
            error: false,
            message: "Leave deleted successfully.",
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export { createLeave, getAllLeaves, getLeaves, userGetLeave, getLeaveById, updateLeave, updateStatus, deleteLeave }