import express from 'express';
import { check } from 'express-validator';
import { auth, isAdmin } from '../middleware/auth';
const leaveManagementRouter = express.Router();

import { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves, createManageLeave, } from '../controllers/leaveManagement';

leaveManagementRouter.get('/', auth, isAdmin, getLeavesMonthWise);

leaveManagementRouter.get('/singleLeave/:id', auth, isAdmin, getSingleLeave);

leaveManagementRouter.get('/userLeaves', auth, getUserLeaves);

leaveManagementRouter.get('/singleLeave/:id', auth, isAdmin, getSingleLeave);

leaveManagementRouter.post('/create-manageLeave',
    check('user', 'User is required.').notEmpty(),
    check('monthly', 'Month is required.').notEmpty(),
    check('leave', 'Leave is required.').notEmpty(),
    auth, isAdmin, createManageLeave);

leaveManagementRouter.post('/search', auth, isAdmin, getLeavesMonthWise);

leaveManagementRouter.put('/updateLeave/:id', auth, isAdmin, updateLeave);

export { leaveManagementRouter };
