import { Router } from 'express';
import { userController } from '../controllers/index';
import { parseJWT } from '../middlewares/authorization.middleware';

const router = Router();

router.get('/', parseJWT, userController.getAllUsers as any);

router.get('/full/:id', userController.getFullUser as any);

router.get('/:id', userController.getUserById as any);

router.get('/project/:id', userController.getUsersByProject as any);

router.post('/', userController.createUser as any);

router.post('/bulk', userController.createBulkUsers as any);

export default router;