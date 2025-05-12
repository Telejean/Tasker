import { Request, Response, NextFunction } from 'express';
import  AuthorizationService  from '../services/authorization.service';

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

            // Check if user is authorized
            const result = await AuthorizationService.isAuthorized(authRequest);

            if (!result.allowed) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to perform this action',
                    reason: result.reason
                });
            }

            // User is authorized, proceed to the route handler
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