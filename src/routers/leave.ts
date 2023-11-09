import express from "express";
import { check } from 'express-validator';
import { auth, isAdmin } from '../middleware/auth'

import { createLeave, deleteLeave, getAllLeaves, getLeaveById, getLeaves, updateLeave, updateStatus, userGetLeave } from "../controllers/leave";

const leaveRouter = express.Router()

leaveRouter.get("/", auth, isAdmin, getAllLeaves)

leaveRouter.get("/leavelist", auth, isAdmin, getLeaves)

leaveRouter.get("/getLeaveById/:id", auth, getLeaveById)

leaveRouter.get("/userLeaves", auth, userGetLeave)

leaveRouter.post("/leavelist-search", auth, isAdmin, getLeaves)

leaveRouter.post("/userLeaves-search", auth, userGetLeave)

leaveRouter.post("/createLeave",
    check('reason', 'Reason is required.').notEmpty(),
    check('startDate', 'Start date is required.').notEmpty(),
    check('endDate', 'End date is required.').notEmpty(),
    check('leaveType', 'Leave type is required.').notEmpty(),
    check('leaveDayType', 'Leave day type is required.').notEmpty(),
    auth, createLeave)

leaveRouter.post("/createLeaveAdmin",
    check('userId', 'User name is required').notEmpty(),
    check('reason', 'Reason is required.').notEmpty(),
    check('startDate', 'Start date is required.').notEmpty(),
    check('endDate', 'End date is required.').notEmpty(),
    check('leaveType', 'Leave type is required.').notEmpty(),
    check('leaveDayType', 'Leave day type is required.').notEmpty(),
    auth, isAdmin, createLeave)

leaveRouter.put("/updateLeave/:id", auth, updateLeave)

leaveRouter.put("/updateStatus/:id", auth, isAdmin, updateStatus);

leaveRouter.delete("/deleteLeave/:id", auth, deleteLeave)

export { leaveRouter };