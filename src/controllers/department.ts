import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Department, { IDepartment } from '../models/department';
import Users from '../models/user';
import { capitalizeFLetter } from '../helper/helper';

const createDepartment = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name }: IDepartment = req.body;

        const existingDepartment = await Department.findOne({ name: capitalizeFLetter(name) });
        if (existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department Is Already Existing."
            });
        }

        const newDepartment = await new Department({ name: capitalizeFLetter(name) }).save();
        return res.status(201).send({
            error: false,
            message: "Department created successfully.",
            department: newDepartment
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getAllDepartment = async (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const filter: string = req.query.query as string || '';
    const sortField: string = req.query.sortField as string || 'createdAt';
    const sortOrder: number = parseInt(req.query.sortOrder as string) || -1;
    let sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortField] = sortOrder === 1 ? 1 : -1;

    try {
        const query = {
            name: { $regex: filter, $options: 'i' },
        };
        const totalDepartments = await Department.countDocuments(query);
        const skip = (page - 1) * limit;

        const departments = await Department.find(query).sort(sortOptions).skip(skip).limit(limit);
        return res.status(200).json({
            error: false,
            message: 'Departments retrieved successfully.',
            departments,
            currentPage: page,
            totalPages: Math.ceil(totalDepartments / limit),
            totalDepartments,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getDepartmentList = async (req: Request, res: Response) => {
    try {
        const departments = await Department.find()
        return res.status(200).json({
            error: false,
            message: "Departments getting successfully.",
            departments,
        });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const getSingleDepartment = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing."
            })
        }

        const getSingle = await Department.findById({ _id: id })
        return res.status(200).json({
            error: false,
            message: "Single department is getting successfully.",
            getSingle
        })
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const updateDepartment = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id
        const { name }: IDepartment = req.body

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing."
            })
        }

        const updateDepartment = await Department.findByIdAndUpdate({ _id: id }, { name: capitalizeFLetter(name) }, { new: true })
        return res.status(201).json({
            error: false,
            message: "Department updated successfully.",
            updateDepartment
        })
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

const deleteDepartment = async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing"
            })
        }

        await Department.findByIdAndDelete({ _id: id })

        const user = await Users.findOne({ department: id })
        if (user) {
            await Users.updateMany({ department: id }, { $unset: { department: "" } })
            return res.status(200).json({
                error: false,
                message: "Department deleted successfully.",
            })
        }
        return res.status(200).json({
            error: false,
            message: "Department deleted successfully.",
        })
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({
            error: true,
            message: 'Server error',
        });
    }
};

export { createDepartment, getAllDepartment, getDepartmentList, getSingleDepartment, updateDepartment, deleteDepartment };