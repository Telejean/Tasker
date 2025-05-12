import express from 'express';
import { teamController } from '../controllers/team.controller';
import { checkPermission } from '../middlewares/authorization.middleware';

const router = express.Router();

// Get all teams
router.get('/', teamController.getAllTeams as any);

// Get team by ID
router.get('/:id', teamController.getTeamById as any);

// Get teams by project
router.get('/project/:projectId', teamController.getTeamsByProject as any);

// Create a new team
router.post('/',  teamController.createTeam as any);

// Update a team
router.put('/:id', teamController.updateTeam as any);

// Update a team member
router.put('/:teamId/member/:userId', teamController.updateTeamMember as any);

// Delete a team
router.delete('/:id',  teamController.deleteTeam as any);

// Remove a member from a team
router.delete('/:teamId/member/:userId', teamController.removeTeamMember as any);

export default router;
