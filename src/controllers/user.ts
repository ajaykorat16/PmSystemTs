import { Request, Response } from 'express';
import { formattedDate, capitalizeFLetter } from '../helper/helper';
import { validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import Users, { IUser } from '../models/user';
import Department from '../models/department';
import LeaveManagement from '../models/leaveManagement';
import Worklog from '../models/worklog';
import Leaves from '../models/leave';
import Credential from '../models/credential';
import mongoose from 'mongoose';
import Projects from '../models/projects';
import * as bcrypt from 'bcrypt';
const secretKey: string = process.env.JWT_SECRET_KEY || '';

const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const comparePassword = async (password: string, hashPassword: string): Promise<boolean> => {
    try {
        const match = await bcrypt.compare(password, hashPassword);
        return match;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createUser = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining, }: IUser = req.body;

        const existingEmployeeNumber = await Users.findOne({ employeeNumber });
        if (existingEmployeeNumber) {
            return res.status(200).json({
                error: true,
                message: "Employee Number should be unique.",
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                error: true,
                message: "User already register with this email.",
            });
        }

        const existingPhone = await Users.findOne({ phone });
        if (existingPhone) {
            return res.status(200).json({
                error: true,
                message: "Phone Number should be unique.",
            });
        }


        const hashedPassword = await hashPassword(password);

        const newUser = await new Users({
            employeeNumber,
            firstname: capitalizeFLetter(firstname),
            lastname: capitalizeFLetter(lastname),
            email,
            password: hashedPassword,
            phone,
            address,
            dateOfBirth,
            department,
            dateOfJoining,
        }).save();


        const doj: Date = new Date(newUser.dateOfJoining);
        const currentDate: Date = new Date();
        const currentMonth: number = currentDate.getMonth();
        const currentYear: number = currentDate.getFullYear();

        if (doj.getFullYear() === currentYear && doj.getMonth() === currentMonth && doj.getDate() <= 15) {
            await new LeaveManagement({ user: newUser._id, monthly: currentDate, leave: 1.5, }).save();
            await Users.findByIdAndUpdate(newUser._id, { $inc: { leaveBalance: 1.5 } }, { new: true });
        }

        return res.status(201).json({
            error: false,
            message: "User created successfully.",
            user: newUser,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const loginUser = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        const { email, password }: { email: string, password: string } = req.body;

        const user = await Users.findOne({ email }).select("-photo").populate("department");
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Invalid Email. Please sign up first.",
            });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({
                error: true,
                message: "Invalid Password.",
            });
        }

        const token = jwt.sign({ user }, secretKey, { expiresIn: "365 days" } as SignOptions);
        return res.status(200).send({
            error: false,
            message: "Login successfully !",
            user,
            token,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const loginUserByAdmin = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        const email: string = req.body.email;

        const user = await Users.findOne({ email }).select("-photo").populate("department"); // Define your Users model or type
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Invalid Email. Please sign up first.",
            });
        }

        const token = jwt.sign({ user }, secretKey, { expiresIn: "365 days" } as SignOptions);
        return res.status(200).send({
            error: false,
            message: "Login successfully!",
            user,
            token,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const getUsers = async (req: any, res: Response) => {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const sortField: string = req.query.sortField as string || 'createdAt';
    const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
    const filter: any = req.body.filter;
    const authUser = req.user;

    try {
        let query = {};

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

            let department: mongoose.Types.ObjectId[] = [];
            let searchdepartment = await Department.find({
                name: { $regex: filter, $options: "i" },
            });
            if (searchdepartment.length !== 0) {
                department = searchdepartment.map((d) => {
                    return d._id;
                });
            }

            query = {
                $or: [
                    { firstname: { $regex: filter, $options: "i" } },
                    { lastname: { $regex: filter, $options: "i" } },
                    { fullName: { $regex: filter, $options: "i" } },
                    { email: { $regex: filter, $options: "i" } },
                    {
                        $expr: {
                            $eq: [{ $month: "$dateOfBirth" }, isNaN(filter) ? null : filter],
                        },
                    },
                    {
                        $expr: {
                            $eq: [{ $year: "$dateOfBirth" }, isNaN(filter) ? null : filter],
                        },
                    },
                    {
                        $expr: {
                            $eq: [
                                { $month: "$dateOfJoining" },
                                isNaN(filter) ? null : filter,
                            ],
                        },
                    },
                    {
                        $expr: {
                            $eq: [{ $year: "$dateOfJoining" }, isNaN(filter) ? null : filter],
                        },
                    },
                    { employeeNumber: { $eq: isNaN(filter) ? null : parseInt(filter) } },
                    { phone: { $eq: isNaN(filter) ? null : parseInt(filter) } },
                    { department: { $in: department } },
                    { dateOfBirth: { $eq: dateSearch } },
                    { dateOfJoining: { $eq: dateSearch } },
                ],
            };
        }

        const skip = (page - 1) * limit;
        let totalEmployee = await Users.countDocuments({ role: "user" });

        let sortOptions: { [key: string]: 1 | -1 } = {};
        sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

        let totalUsers: any;
        let users: any;
        if (authUser.role === "user") {
            totalUsers = await Users.countDocuments({ ...query, role: "user" });
            users = await Users.find({ ...query, role: "user", }).sort(sortOptions).skip(skip).limit(limit).populate("department").lean();
        } else {
            totalUsers = await Users.countDocuments(query);
            users = await Users.find(query).sort(sortOptions).skip(skip).limit(limit).populate("department").lean();
        }

        const formattedUsers = await Promise.all(
            users.map(async (user: IUser) => {
                const photoUrl = user.photo && user.photo.contentType && user.photo.data
                    ? `data:${user.photo.contentType};base64,${user.photo.data.toString("base64")}`
                    : null;

                const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

                let departmentName: string | null = null;

                if (user.department) {
                    const department = await Department.findById(user.department);
                    departmentName = department?.name || null;
                }

                return {
                    ...user,
                    avatar,
                    department: departmentName,
                    dateOfBirth: formattedDate(user.dateOfBirth),
                    dateOfJoining: formattedDate(user.dateOfJoining),
                    photo: photoUrl,
                };
            })
        );

        return res.status(200).json({
            error: false,
            message: "Users retrieved successfully.",
            users: formattedUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
            totalEmployee,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const getUserProfile = async (req: any, res: Response) => {
    try {
        const id: string = req.params.id;

        let getProfile: any;
        if (id) {
            getProfile = await Users.findById({ _id: id }).populate("department").populate("projects.id");
        } else {
            getProfile = await Users.findById({ _id: req.user._id }).populate("department").populate("projects.id");
        }

        const photoUrl =
            getProfile.photo && getProfile.photo.contentType
                ? `data:${getProfile.photo.contentType};base64,${getProfile.photo.data.toString("base64")}`
                : null;

        return res.status(200).json({
            error: false,
            message: "Users get profile successfully!!",
            getProfile: {
                ...getProfile.toObject(),
                photo: photoUrl,
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

export const getUserByBirthDayMonth = async (req: any, res: Response) => {
    try {
        const d: Date = new Date();
        let month: number = d.getMonth() + 1;
        const page: number = parseInt(req.query.page as string) || 1;
        const limit: number = parseInt(req.query.limit as string) || 10;
        const filter: number = req.body.filter || month;

        let query: any;
        if (filter) {
            const filterMonth = filter ? filter : month;
            query = {
                $or: [
                    {
                        $expr: {
                            $eq: [{ $month: "$dateOfBirth" }, filterMonth],
                        },
                    },
                ],
            };
        }

        const totalUsers: number = await Users.countDocuments(query);
        const skip: number = (page - 1) * limit;

        const aggregationPipeline: any[] = [
            { $match: query },
            {
                $addFields: {
                    dayOfMonth: { $dayOfMonth: "$dateOfBirth" },
                },
            },
            { $sort: { dayOfMonth: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "departments",
                    let: { departmentId: "$department" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$departmentId"],
                                },
                            },
                        },
                    ],
                    as: "department",
                },
            },
            {
                $addFields: {
                    department: { $arrayElemAt: ["$department", 0] },
                },
            },
        ];

        const users: any[] = await Users.aggregate(aggregationPipeline);

        const formattedUsers = users.map((user) => {
            const photoUrl =
                user.photo && user.photo.contentType
                    ? `data:${user.photo.contentType};base64,${user.photo.data.toString("base64")}`
                    : null;
            const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

            return {
                ...user,
                avatar: avatar,
                department: user.department ? user.department.name : null,
                dateOfBirth: formattedDate(user.dateOfBirth),
                dateOfJoining: formattedDate(user.dateOfJoining),
                photo: photoUrl,
            };
        });

        return res.status(200).json({
            error: false,
            message: "Users retrieved successfully.",
            users: formattedUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const getAllUsers = await Users.find({ role: "user" }).select("-photo");

        return res.status(200).json({
            error: false,
            message: "All users retrieved successfully.",
            getAllUsers,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const userForCredential = async (req: any, res: Response) => {
    try {
        const loginUser: mongoose.Types.ObjectId = req.user._id;
        const getAllUsers: IUser[] = await Users.find({ _id: { $ne: loginUser } }).select("-photo");

        return res.status(200).json({
            error: false,
            message: "All users are retrieved successfully.",
            getAllUsers,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const updateUser = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { employeeNumber, firstname, lastname, phone, address, dateOfBirth, department, dateOfJoining, projects } = req.fields;
        const { photo } = req.files;
        const { id } = req.params;

        let projectArr: mongoose.Types.ObjectId[] = [];
        if (typeof projects !== 'undefined') {
            projectArr = JSON.parse(projects);
        }

        let user: any;
        if (id) {
            user = await Users.findById(id);
        } else {
            user = await Users.findById(req.user._id);
        }

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        const existingPhone: IUser | null = await Users.findOne({ phone, _id: { $ne: user._id } });
        if (existingPhone !== null) {
            return res.status(200).json({
                error: true,
                message: 'Phone Number should be unique.',
            });
        }

        const updatedFields: Partial<IUser> = {
            employeeNumber: employeeNumber || user.employeeNumber,
            firstname: firstname ? capitalizeFLetter(firstname) : user.firstname,
            lastname: lastname ? capitalizeFLetter(lastname) : user.lastname,
            phone: phone || user.phone,
            address: address || user.address,
            dateOfBirth: dateOfBirth || user.dateOfBirth,
            department: department || user.department,
            dateOfJoining: dateOfJoining ? dateOfJoining : user.dateOfJoining,
            photo: user.photo,
            fullName: (firstname ? capitalizeFLetter(firstname) : user.firstname) + ' ' + (lastname ? capitalizeFLetter(lastname) : user.lastname),
        };

        if (photo) {
            updatedFields.photo = {
                data: Buffer.from(photo.data),
                contentType: photo.contentType,
            };
        }

        if (projectArr && Array.isArray(projectArr)) {
            const newProjectIds = projectArr.map((p) => {
                return { id: new mongoose.Types.ObjectId(p) };
            });
            updatedFields.projects = newProjectIds;
        }

        const updateUser = await Users.findByIdAndUpdate(user._id, updatedFields, { new: true });

        for (const projectsId of user.projects) {
            await Projects.findByIdAndUpdate(projectsId.id, { $pull: { developers: { id: user._id } } });
        }

        for (const projectsId of projectArr) {
            await Projects.findByIdAndUpdate(projectsId, { $addToSet: { developers: { id: user._id } } });
        }

        return res.status(201).json({
            error: false,
            message: 'Updated Successfully !!',
            updateUser,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const deleteUserProfile = async (req: any, res: Response) => {
    try {
        const id: string = req.params.id;

        const user: IUser | null = await Users.findOne({ _id: id });
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid User.",
            });
        }

        await Users.findByIdAndDelete({ _id: id });
        await LeaveManagement.deleteMany({ user: id });
        await Worklog.deleteMany({ userId: id });
        await Leaves.deleteMany({ userId: id });
        await Projects.updateMany({ "developers.id": id }, { $pull: { developers: { id } } });
        await Credential.deleteMany({ createdBy: id });
        await Credential.updateMany({ "users.id": id }, { $pull: { users: { id } } });

        return res.status(200).send({
            error: false,
            message: "User deleted successfully.",
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export const changePasswordController = async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        const user: mongoose.Types.ObjectId = req.user._id;
        const password: string = req.body.password;

        const hashed = await hashPassword(password);
        await Users.findByIdAndUpdate(user, { password: hashed });
        return res.status(200).send({
            error: false,
            message: "Password Reset Successfully.",
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};