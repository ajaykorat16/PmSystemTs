import express from 'express';
import { check } from 'express-validator';
import { auth, isAdmin } from '../middleware/auth';
import formidableMiddleware from 'express-formidable';
const userRouter = express.Router()

import { createUser, loginUser, updateUser, deleteUserProfile, getAllUser, getUserProfile, changePasswordController, getUsers, getUserByBirthDayMonth, loginUserByAdmin, userForCredential } from '../controllers/user';

userRouter.get("/", auth, isAdmin, getUsers)

userRouter.get("/userList", auth, isAdmin, getAllUser)

userRouter.get("/getUserProfile/:id", auth, formidableMiddleware(), getUserProfile)

userRouter.get("/credentialUser", auth, userForCredential)

userRouter.get("/getUserByBirthDayMonth", auth, getUserByBirthDayMonth)

userRouter.get("/employeeList", auth, getUsers)

userRouter.get("/profile", auth, getUserProfile)

userRouter.get('/admin-auth', auth, isAdmin, (req, res) => {
    res.status(200).json({ ok: true })
})

userRouter.get('/user-auth', auth, (req, res) => {
    res.status(200).json({ ok: true })
})

userRouter.post("/register",
    check('employeeNumber', 'Employee Number is reruired.').notEmpty(),
    check('firstname', 'Firstname is required.').notEmpty(),
    check('lastname', 'Lastname is required.').notEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    check('phone', 'Phone number is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('dateOfBirth', 'Date of birth is required.').notEmpty(),
    check('department', 'Department is required.').notEmpty(),
    check('dateOfJoining', 'Date of joining is required').notEmpty(),
    createUser
)

userRouter.post("/addUser",
    check('employeeNumber', 'Employee Number is reruired.').notEmpty(),
    check('firstname', 'Firstname is required.').notEmpty(),
    check('lastname', 'Lastname is required.').notEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    check('phone', 'Phone number is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('dateOfBirth', 'Date of birth is required.').notEmpty(),
    check('department', 'Department is required.').notEmpty(),
    check('dateOfJoining', 'Date of joining is required').notEmpty(),
    auth, isAdmin, createUser
)

userRouter.post("/login",
    check('email', 'Email is required.').isEmail(),
    check('password', 'Password is required.').notEmpty(),
    loginUser
)

userRouter.post("/loginByAdmin",
    check('email', 'Email is required.').isEmail(), auth,
    loginUserByAdmin
)

userRouter.post("/getUserByBirthDayMonth-search", auth, getUserByBirthDayMonth)

userRouter.post("/user-search", auth, getUsers)

userRouter.put("/updateProfile", auth, formidableMiddleware(), updateUser)

userRouter.put("/updateProfile/:id", auth, isAdmin, formidableMiddleware(), updateUser)

userRouter.put("/resetPassword",
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    auth, changePasswordController
)

userRouter.delete("/deleteProfile/:id", auth, isAdmin, deleteUserProfile)

export { userRouter }