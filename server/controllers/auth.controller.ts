import { Request, Response } from 'express';
import { User } from '../models/User.model';
import passport from 'passport';
import { createUserService } from '../services/user.service';
import authorizationService from '../services/authorization.service';
import jwt from 'jsonwebtoken';

/**
 * JWT token generation function
 */

const generateToken = (user: any) => {

    const secret = process.env.JWT_SECRET || 'your-secret-key-here';

    return jwt.sign(user, secret, { expiresIn: '24h' });
};

export const authController = {
    // Google OAuth callback handler
    // async handleGoogleCallback(req: Request, res: Response) {
    //     const user = req.user as { isNewUser: boolean; email: string; googleProfile: { name: string; surname: string } };
    //     if (user?.isNewUser) {
    //         const params = new URLSearchParams({
    //             email: user.email,
    //             name: user.googleProfile.name,
    //             surname: user.googleProfile.surname
    //         });
    //         res.redirect(`${process.env.CLIENT_URL}/register?${params.toString()}`);
    //     } else {
    //         res.redirect(`${process.env.CLIENT_URL}/home`);
    //     }
    // },

    async handleGoogleCallbackJWT(req: Request, res: Response) {
        try {
            const user = req.user as any;

            if (user?.isNewUser) {
                const params = new URLSearchParams({
                    email: user.email,
                    name: user.googleProfile.name,
                    surname: user.googleProfile.surname
                });
                res.redirect(`${process.env.CLIENT_URL}/register?${params.toString()}`);
            } else {
                const token = generateToken(user.dataValues);

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
            }
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.CLIENT_URL}/login?error=AuthenticationFailed`);
        }
    },

    async completeRegistration(req: Request, res: Response) {
        try {
            const { email } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = await createUserService(req.body)
            const token = generateToken(user);
            console.log('User created:', token);

            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging in' });
                }
                return res.status(201).json({ user });
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error completing registration', error: error });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            const token = generateToken(user);

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                },
                token
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error during login' });
        }
    },

    async logout(req: Request, res: Response) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        res.json({ success: true });
    },

    async checkStatus(req: Request, res: Response) {
        try {
            let token = req.cookies?.token;
            if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1];
            }
            if (!token) {
                return res.status(401).json({ isAuthenticated: false });
            }
            const secret = process.env.JWT_SECRET || 'your-secret-key-here';
            let decoded: any;
            try {
                decoded = jwt.verify(token, secret);
            } catch (err) {
                return res.json({ isAuthenticated: false });
            }
            const userDB = await User.findByPk(decoded.id);
            if (!userDB) return res.json({ isAuthenticated: false });
            res.status(200).json({
                isAuthenticated: true,
                user: decoded
            });
        } catch (error) {
            console.error('JWT status check error:', error);
            res.status(401).json({ isAuthenticated: false });
        }
    },

    async checkPermission(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.json({ hasPermission: false });
            }

            const { action, resourceType, resourceId, resourceAttributes } = req.query;

            if (!action || !resourceType) {
                return res.status(400).json({
                    error: 'Missing required parameters: action and resourceType are required'
                });
            }

            const user = req.user as any;

            if (user.isAdmin) {
                return res.json({ hasPermission: true });
            }

            let parsedResourceAttributes;
            if (resourceAttributes) {
                try {
                    parsedResourceAttributes = JSON.parse(resourceAttributes as string);
                } catch (error) {
                    console.error('Error parsing resourceAttributes:', error);
                    parsedResourceAttributes = {};
                }
            }

            const authRequest = {
                subject: {
                    userId: user.id
                },
                action: {
                    type: action as string
                },
                resource: {
                    type: resourceType as string,
                    id: resourceId ? Number(resourceId) : undefined,
                    attributes: parsedResourceAttributes || {}
                },
                environment: {
                    time: new Date(),
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                }
            };

            const result = await authorizationService.isAuthorized(authRequest);
            res.status(200).json({
                hasPermission: result.allowed,
                reason: result.reason
            });
        } catch (error) {
            console.error('Error checking permission:', error);
            res.status(500).json({
                error: 'An error occurred while checking permission',
                hasPermission: false
            });
        }
    },

    async checkPermissionsBatch(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.json({
                    results: {},
                    message: 'User not authenticated'
                });
            }

            const { permissions } = req.body;

            if (!permissions || !Array.isArray(permissions)) {
                return res.status(400).json({
                    error: 'Missing or invalid permissions array'
                });
            }

            const user = req.user as any;
            const results: Record<string, boolean> = {};

            if (user.isAdmin) {
                for (const perm of permissions) {
                    const { action, resourceType, resourceId } = perm;
                    const key = `${action}:${resourceType}${resourceId ? `:${resourceId}` : ''}`;
                    results[key] = true;
                }
                return res.json({ results });
            }

            for (const perm of permissions) {
                const { action, resourceType, resourceId, resourceAttributes } = perm;
                const key = `${action}:${resourceType}${resourceId ? `:${resourceId}` : ''}`;

                try {
                    const authRequest = {
                        subject: {
                            userId: user.id
                        },
                        action: {
                            type: action
                        },
                        resource: {
                            type: resourceType,
                            id: resourceId,
                            attributes: resourceAttributes || {}
                        },
                        environment: {
                            time: new Date(),
                            ip: req.ip || req.connection.remoteAddress,
                            userAgent: req.get('User-Agent')
                        }
                    };

                    const result = await authorizationService.isAuthorized(authRequest);
                    results[key] = result.allowed;
                } catch (err) {
                    console.error(`Error checking permission ${key}:`, err);
                    results[key] = false;
                }
            }

            res.json({ results });
        } catch (error) {
            console.error('Error batch checking permissions:', error);
            res.status(500).json({
                error: 'An error occurred while batch checking permissions',
                results: {}
            });
        }
    },

    async checkABACPermission(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    allowed: false,
                    reason: 'User not authenticated'
                });
            }

            const { subject, action, resource, environment } = req.body;

            if (!action?.type || !resource?.type) {
                return res.status(400).json({
                    error: 'Missing required parameters: action.type and resource.type are required',
                    allowed: false
                });
            }

            const user = req.user as any;

            const authRequest = {
                subject: {
                    userId: user.id,
                    ...subject 
                },
                action,
                resource,
                environment: {
                    time: new Date(),
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    ...environment 
                }
            };

            const result = await authorizationService.isAuthorized(authRequest);
            res.json(result);
        } catch (error) {
            console.error('Error in ABAC permission check:', error);
            res.status(500).json({
                allowed: false,
                reason: 'Internal server error during permission check'
            });
        }
    },
}