import { Router } from 'express';
import { taskController } from '../controllers/index';

const router = Router();

// GET all tasks
router.get('/', taskController.getAllTasks as any);

// GET task by ID
router.get('/:id', taskController.getTaskById as any);

// POST create task
router.post('/', taskController.createTask as any);

router.post('/bulk', taskController.bulkCreateTasks as any);

// PUT update task
router.put('/:id', taskController.updateTask as any);

// DELETE task
router.delete('/:id', taskController.deleteTask as any);

export default router;