import { Router } from 'express';
import { userController } from '../controllers/index';

const router = Router();

// GET all users
router.get('/', userController.getAllUsers as any);

// GET user by ID
router.get('/:id', userController.getUserById as any);

// POST create user
router.post('/', userController.createUser as any);

// POST create multiple users
router.post('/bulk', userController.createBulkUsers as any);

export default router;