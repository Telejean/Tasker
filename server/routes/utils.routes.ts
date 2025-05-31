import { Router } from 'express';
import { utilsController } from '../controllers/index';

const router = Router();

router.get('/sync', (req, res) => {
    console.log(req.query)
    const force = req.query.force === 'true';
    utilsController.syncDatabase(req, res, force);
});

export default router;