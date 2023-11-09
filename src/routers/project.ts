import express, { Router } from 'express';
import { check } from 'express-validator';
import { auth, isAdmin } from "../middleware/auth";
const projectRouter: Router = express.Router();

import { createProject, getAllProjects, getProjects, getUserProjects, updateProject, delelteProject, getSingleProject, userProjects } from '../controllers/project';

projectRouter.get("/project-list", auth, getAllProjects)

projectRouter.get("/user-project-list", auth, userProjects)

projectRouter.post("/create",
    check('name', 'Project name is required.').notEmpty(),
    check('startDate', 'Project start date is required.').notEmpty(),
    check('description', 'Project description is required.').notEmpty(),
    auth, isAdmin, createProject)

projectRouter.get("/", auth, isAdmin, getProjects)

projectRouter.get("/single-project/:id", auth, isAdmin, getSingleProject)

projectRouter.post("/project-search", auth, isAdmin, getProjects)

projectRouter.get("/developer-project-list", auth, getUserProjects)

projectRouter.post("/search-project-list", auth, getUserProjects)

projectRouter.put("/update-project/:id", auth, isAdmin, updateProject)

projectRouter.delete("/delete-project/:id", auth, isAdmin, delelteProject)


export { projectRouter }