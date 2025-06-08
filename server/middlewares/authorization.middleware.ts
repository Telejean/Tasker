import { Request, Response, NextFunction } from 'express';
import AuthorizationService from '../services/authorization.service';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

export const checkPermission = (
    actionType: string,
    resourceType: string,
    getResourceId: (req: Request) => number | null = (req) => {
        return req.params.id ? parseInt(req.params.id) : null;
    },
    getResourceAttributes: (req: Request) => Record<string, any> = () => ({}) // Add this parameter
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
            const resourceAttributes = getResourceAttributes(req); 

            const authRequest = {
                subject: {
                    userId
                },
                action: {
                    type: actionType
                },
                resource: {
                    type: resourceType,
                    id: resourceId,
                    attributes: resourceAttributes 
                },
                environment: {
                    time: new Date(),
                    ip: req.ip || req.connection.remoteAddress, 
                    userAgent: req.get('User-Agent')
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

export const checkSimplePermission = (
    action: string,
    resourceType: string,
    getResourceId: (req: Request) => number | undefined = (req) => {
        return req.params.id ? parseInt(req.params.id) : undefined;
    },
    getProjectId: (req: Request) => number | undefined = () => undefined
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
            const projectId = getProjectId(req);

            const hasPermission = await AuthorizationService.checkPermission({
                userId,
                action,
                resourceType,
                resourceId,
                projectId
            });

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to perform this action'
                });
            }

            next();
        } catch (error) {
            console.error('Error checking simple permission:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An error occurred while checking permissions'
            });
        }
    };
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be logged in to access this resource'
            });
        }

        const user = req.user as any;
        if (!user.isAdmin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Error checking admin permission:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while checking admin permissions'
        });
    }
};

export const requireOwnership = (
    getOwnerId: (req: Request) => Promise<number | null>
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
            const ownerId = await getOwnerId(req);

            if (ownerId !== userId) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only access your own resources'
                });
            }

            next();
        } catch (error) {
            console.error('Error checking ownership:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'An error occurred while checking ownership'
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
            const error = err as any;
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Unauthorized', message: 'Token has expired' });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
            }
            return res.status(401).json({ error: 'Unauthorized', message: 'Token verification failed' });
        }

        const userDB = await User.findByPk(decoded.id);
        if (!userDB) {
            return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
        }

        // Check if user account is active (if you have this field)
        // if (!userDB.isActive) {
        //     return res.status(401).json({ error: 'Unauthorized', message: 'User account is deactivated' });
        // }

        req.user = userDB;
        next();
    } catch (error) {
        console.error('JWT auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: 'Error authenticating token' });
    }
};

export const parseJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next();
        }

        const secret = process.env.JWT_SECRET || 'your-secret-key-here';
        let decoded: any;

        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return next();
        }

        const userDB = await User.findByPk(decoded.id);
        if (!userDB) {
            return next();
        }

        req.user = userDB;
        next();
    } catch (error) {
        console.log("Error parsing the jwt token", error);
        next();
    }
};