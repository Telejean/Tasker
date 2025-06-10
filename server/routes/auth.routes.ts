import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import passport from 'passport';
import { jwtAuth } from '../middlewares/authorization.middleware';

const router = Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     authController.handleGoogleCallback
// );

router.get('/google/jwt', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/jwt/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.handleGoogleCallbackJWT
);

router.post('/complete-registration', authController.completeRegistration as any);

router.get('/status', authController.checkStatus as any);

router.post('/logout', authController.logout);

router.get('/check-permission',jwtAuth as any,  authController.checkPermission as any);
router.get('/check-permission-abac',jwtAuth as any,  authController.checkABACPermission as any);
router.post('/check-permissions-batch',jwtAuth as any, authController.checkPermissionsBatch as any);

export default router;