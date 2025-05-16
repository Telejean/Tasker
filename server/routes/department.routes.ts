import express from 'express';
import { departmentController } from '../controllers/department.controller';

const router = express.Router();

router.get('/', departmentController.getAllDepartments as any);
router.get('/:id', departmentController.getDepartmentById as any);
router.post('/', departmentController.createDepartment as any);
router.post('/bulk', departmentController.bulkCreateDepartments as any);
router.put('/:id', departmentController.updateDepartment as any);
router.delete('/:id', departmentController.deleteDepartment as any);

export default router;
