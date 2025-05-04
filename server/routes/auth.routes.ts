import { Router } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google'),
    authController.handleGoogleCallback
);


// Complete registration for new Google users
router.post('/complete-registration', authController.completeRegistration as any);

// Check authentication status
router.get('/status', authController.checkAuthStatus);

// Logout route
router.post('/logout', authController.logout);

export default router;