import { Router } from 'express';
import { taskController } from '../controllers/index';

const router = Router();

router.get('/', taskController.getAllTasks as any);

router.get('/my-tasks', taskController.getMyTasks as any);

router.get('/project/:id', taskController.getTasksByProject as any);

router.get('/:id', taskController.getTaskById as any);

router.post('/', taskController.createTask as any);

router.post('/bulk', taskController.bulkCreateTasks as any);

router.put('/:id', taskController.updateTask as any);

router.delete('/:id', taskController.deleteTask as any);

export default router;