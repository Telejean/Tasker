import { Router } from 'express';
import { taskController } from '../controllers/index';
import { jwtAuth } from '../middlewares/authorization.middleware';

const router = Router();

router.get('/', taskController.getAllTasks as any);

router.get('/my-tasks', jwtAuth as any, taskController.getMyTasks as any);

router.get('/project/:id', jwtAuth as any, taskController.getTasksByProject as any);

router.get('/:id', taskController.getTaskById as any);

router.post('/', taskController.createTask as any);

router.post('/bulk', taskController.bulkCreateTasks as any);

router.put('/:id', taskController.updateTask as any);

router.delete('/:id', taskController.deleteTask as any);

router.post('/:id/users', taskController.addUserToTask as any);

export default router;