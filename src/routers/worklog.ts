import express, { Router } from 'express';
import { check } from 'express-validator';
import { auth, isAdmin } from "../middleware/auth";

import { createWorkLog, deleteWorklog, getAllWorklog, getSingleWorklog, updateWorklog, userGetWorklog } from '../controllers/worklog';

const worklogRouter: Router = express.Router();

worklogRouter.get('/user-worklog', auth, userGetWorklog)

worklogRouter.get('/', auth, isAdmin, getAllWorklog)

worklogRouter.get('/single-worklog/:id', auth, getSingleWorklog)

worklogRouter.post("/create",
    check('project', 'Project name is required.').notEmpty(),
    check('logDate', 'Work log date is required.').notEmpty(),
    check('time', 'Work log time is required.').notEmpty(),
    check('description', 'Work log description is required.').notEmpty(),
    auth, createWorkLog
);

worklogRouter.post('/search-worklog', auth, userGetWorklog)

worklogRouter.post('/admin-search-worklog', auth, isAdmin, getAllWorklog)

worklogRouter.put('/update-worklog/:id', auth, updateWorklog)

worklogRouter.delete("/delete-worklog/:id", auth, deleteWorklog)

export { worklogRouter }