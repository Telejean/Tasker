import { Request, Response, NextFunction } from 'express';
import  AuthorizationService  from '../services/authorization.service';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

export const checkPermission = (
    actionType: string,
    resourceType: string,
    getResourceId: (req: Request) => number | null = (req) => {
        return req.params.id ? parseInt(req.params.id) : null;
    }
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'You must be logged in to access this resource'
                });
            }

            const userId = (req.user as any).id;
            const resourceId = getResourceId(req);

            // Build the authorization request
            const authRequest = {
                subject: {
                    userId
                },
                action: {
                    type: actionType
                },
                resource: {
                    type: resourceType,
                    id: resourceId
                },
                environment: {
                    time: new Date()
                }
            };

            const result = await AuthorizationService.isAuthorized(authRequest);

            if (!result.allowed) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to perform this action',
                    reason: result.reason
                });
            }

            next();
        } catch (error) {
            console.error('Error checking permission:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An error occurred while checking permissions'
            });
        }
    };
};

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
        }
        const secret = process.env.JWT_SECRET || 'your-secret-key-here';
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        }
        const userDB = await User.findByPk(decoded.id);
        if (!userDB) {
            return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
        }
        req.user = userDB;
        next();
    } catch (error) {
        console.error('JWT auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Error authenticating token' });
    }
};