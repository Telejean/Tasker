import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import passport from 'passport';

const router = Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.handleGoogleCallback
);

// JWT Google OAuth route (alternative to session-based auth)
router.get('/google/jwt', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/jwt/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.handleGoogleCallbackJWT
);

router.post('/complete-registration', authController.completeRegistration as any);

// Check auth status
router.get('/status', authController.checkStatus);

// Logout
router.post('/logout', authController.logout);

// ABAC permission check endpoints
router.get('/check-permission', authController.checkPermission as any);
router.post('/check-permissions-batch', authController.checkPermissionsBatch as any);

export default router;