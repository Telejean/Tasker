import { Router } from 'express';
import { projectController } from '../controllers/index';
import { jwtAuth } from '../middlewares/authorization.middleware';

const router = Router();

// GET all projects
router.get('/', projectController.getAllProjects as any);

// GET project by ID
router.get('/my-projects',jwtAuth as any, projectController.getMyProjects as any);

router.get('/:id', projectController.getProjectById as any);

// POST create project
router.post('/', projectController.createProject as any);

// PUT update project
router.put('/:id', projectController.updateProject as any);

// DELETE project
router.delete('/:id', projectController.deleteProject as any);

export default router;