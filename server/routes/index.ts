import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import policyRoutes from './policy.routes';

const router = Router();

// Mount all routes
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/policies', policyRoutes);

export default router;