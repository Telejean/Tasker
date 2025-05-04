import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { UserRoles } from '../types';
import passport from 'passport';
import { createUserService } from '../services/user.service';

export const authController = {
    // Google OAuth callback handler
    async handleGoogleCallback(req: Request, res: Response) {
        const user = req.user as { isNewUser: boolean; email: string; googleProfile: { name: string; surname: string } };
        if (user?.isNewUser) {
            const params = new URLSearchParams({
            email: user.email,
            name: user.googleProfile.name,
            surname: user.googleProfile.surname
            });
            res.redirect(`${process.env.CLIENT_URL}/register?${params.toString()}`);
        } else {
            res.redirect(`${process.env.CLIENT_URL}/home`);
        }
    },

    async completeRegistration(req: Request, res: Response) {
        try {
            const { email } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = createUserService(req.body)

            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging in' });
                }
                return res.status(201).json({ user });
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error completing registration' });
        }
    },

    async checkAuthStatus(req: Request, res: Response) {
        if (req.isAuthenticated()) {
            res.json({ isAuthenticated: true, user: req.user });
        } else {
            res.json({ isAuthenticated: false });
        }
    },

    // Handle logout
    async logout(req: Request, res: Response) {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error logging out' });
            }
            res.json({ success: true });
        });
    }
};