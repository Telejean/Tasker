import { Router } from 'express';
import { utilsController } from '../controllers/index';

const router = Router();

router.get('/sync', utilsController.syncDatabase);

export default router;