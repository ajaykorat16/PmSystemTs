import { Request, Response, NextFunction } from 'express';
import Users from '../models/user';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token: string | undefined = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });

    }

    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY as string, (error, decoded: any) => {
            if (error) {
                return res.status(401).json({ msg: 'Token is not valid' });
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        return res.status(500).json({ msg: 'Server Error' });
    }
};

const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await Users.findById(req.user._id)

        if (!user) {
            return res.status(401).send({
                error: true,
                message: 'User not found',
            });

        }

        if (user.role !== 'admin') {
            return res.status(401).send({
                error: true,
                message: 'Unauthorized Access',
            });
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).send({
            error: true,
            message: 'Error in Admin Middleware',
        });
    }
};

export { auth, isAdmin };
