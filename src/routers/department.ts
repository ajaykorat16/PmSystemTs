import express from "express";
import { auth, isAdmin } from "../middleware/auth";
import { check } from 'express-validator';
const departmentRouter = express.Router()

import { createDepartment, deleteDepartment, getAllDepartment, getDepartmentList, getSingleDepartment, updateDepartment } from "../controllers/department";

departmentRouter.get("/", auth, isAdmin, getAllDepartment);

departmentRouter.get("/departmentlist", auth, isAdmin, getDepartmentList);

departmentRouter.get("/getSingleDepartment/:id", auth, isAdmin, getSingleDepartment);

departmentRouter.post("/createDepartment",
    check('name', 'Department name is required.').notEmpty(),
    auth, isAdmin, createDepartment
);

departmentRouter.put("/updateDepartment/:id", auth, isAdmin, updateDepartment)

departmentRouter.delete("/deleteDepartment/:id", auth, isAdmin, deleteDepartment)

export { departmentRouter }