import { Router } from 'express';
import { projectController } from '../controllers/index';
import { jwtAuth } from '../middlewares/authorization.middleware';

const router = Router();

router.get('/', projectController.getAllProjects as any);

router.get('/my-projects',jwtAuth as any, projectController.getMyProjects as any);

router.get('/:id', projectController.getProjectById as any);

router.post('/', projectController.createProject as any);

router.put('/:id', projectController.updateProject as any);

router.delete('/:id', projectController.deleteProject as any);

export default router;