import { Router } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import policyRoutes from './policy.routes';
import utilsRoutes from './utils.routes';
import authRoutes from './auth.routes';
import teamRoutes from './team.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/teams', teamRoutes);
router.use('/policies', policyRoutes);
router.use('/utils', utilsRoutes);
router.use("*", (req, res) => {
    res.status(501).json("route not found")
})
export default router;