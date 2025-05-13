import express from 'express';
import { teamController } from '../controllers/team.controller';
import { checkPermission } from '../middlewares/authorization.middleware';

const router = express.Router();

router.get('/', teamController.getAllTeams as any);

router.get('/:id', teamController.getTeamById as any);

router.get('/project/:projectId', teamController.getTeamsByProject as any);

router.post('/',  teamController.createTeam as any);

router.put('/:id', teamController.updateTeam as any);

router.put('/:teamId/member/:userId', teamController.updateTeamMember as any);

router.delete('/:id',  teamController.deleteTeam as any);

router.delete('/:teamId/member/:userId', teamController.removeTeamMember as any);

export default router;
