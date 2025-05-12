import type { Request, Response } from 'express';
import { Team, User, UserTeam, Project } from '../models';
import { Op } from 'sequelize';

export const teamController = {
    async getAllTeams(req: Request, res: Response) {
        try {
            const teams = await Team.findAll({
                include: [
                    {
                        model: Project,
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        through: {
                            attributes: ['userRole', 'assignedAt']
                        },
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
            return res.status(200).json(teams);
        } catch (error) {
            console.error('Error getting teams:', error);
            return res.status(500).json({ error: 'Failed to retrieve teams' });
        }
    },

    async getTeamById(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.id); const team = await Team.findByPk(teamId, {
                include: [
                    {
                        model: Project,
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        through: {
                            attributes: ['userRole', 'assignedAt']
                        },
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            return res.status(200).json(team);
        } catch (error) {
            console.error('Error getting team:', error);
            return res.status(500).json({ error: 'Failed to retrieve team' });
        }
    },

    async getTeamsByProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.projectId); const teams = await Team.findAll({
                where: { projectId },
                include: [
                    {
                        model: User,
                        through: {
                            attributes: ['userRole', 'assignedAt']
                        },
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return res.status(200).json(teams);
        } catch (error) {
            console.error('Error getting project teams:', error);
            return res.status(500).json({ error: 'Failed to retrieve teams' });
        }
    },

    async createTeam(req: Request, res: Response) {
        try {
            const { name, projectId, userIds = [] } = req.body;

            // Create the team
            const team = await Team.create({
                name,
                projectId
            });

            // Add users to the team with member role if provided
            if (userIds.length > 0) {
                const userTeams = userIds.map((userId: number) => ({
                    userId,
                    teamId: team.id,
                    userRole: "MEMBER"
                }));

                await UserTeam.bulkCreate(userTeams);
            }

            // Fetch the complete team with associations            
            const createdTeam = await Team.findByPk(team.id, {
                include: [
                    {
                        model: Project,
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        through: {
                            attributes: ['userRole', 'assignedAt']
                        },
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            return res.status(201).json(createdTeam);
        } catch (error) {
            console.error('Error creating team:', error);
            return res.status(500).json({ error: 'Failed to create team' });
        }
    },

    async updateTeam(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.id);
            const { name, userIds } = req.body;

            // Find the team by ID
            const team = await Team.findByPk(teamId);

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            // Update team fields
            if (name !== undefined) team.name = name;

            // Save the changes
            await team.save();

            // Update team members if provided
            if (userIds && userIds.length >= 0) {
                // Get current team members excluding owners
                const currentUserTeams = await UserTeam.findAll({
                    where: {
                        teamId,
                        userRole: { [Op.ne]: 'OWNER' }
                    }
                });

                const currentUserIds = currentUserTeams.map(ut => ut.userId);

                // Determine users to remove and users to add
                const usersToRemove = currentUserIds.filter(id => !userIds.includes(id));
                const usersToAdd = userIds.filter((id: number) => !currentUserIds.includes(id));

                // Remove users no longer in the team
                if (usersToRemove.length > 0) {
                    await UserTeam.destroy({
                        where: {
                            teamId,
                            userId: usersToRemove,
                            userRole: { [Op.ne]: 'OWNER' } // Don't remove owners
                        }
                    });
                }

                // Add new users to the team
                if (usersToAdd.length > 0) {
                    const newUserTeams = usersToAdd.map((userId: number) => ({
                        userId,
                        teamId,
                        userRole: 'MEMBER'
                    }));

                    await UserTeam.bulkCreate(newUserTeams);
                }
            }

            // Fetch the updated team with associations
            const updatedTeam = await Team.findByPk(teamId, {
                include: [
                    {
                        model: Project,
                        attributes: ['id', 'name']
                    },
                    {
                        model: UserTeam,
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });

            return res.status(200).json(updatedTeam);
        } catch (error) {
            console.error('Error updating team:', error);
            return res.status(500).json({ error: 'Failed to update team' });
        }
    },

    async updateTeamMember(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.teamId);
            const userId = parseInt(req.params.userId);
            const { userRole } = req.body;

            // Find the team member
            const userTeam = await UserTeam.findOne({
                where: { teamId, userId }
            });

            if (!userTeam) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            // Update team member role
            if (userRole) userTeam.userRole = userRole;

            // Save the changes
            await userTeam.save();

            return res.status(200).json(userTeam);
        } catch (error) {
            console.error('Error updating team member:', error);
            return res.status(500).json({ error: 'Failed to update team member' });
        }
    },

    async deleteTeam(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.id);

            const team = await Team.findByPk(teamId);

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            // Delete all team members first
            await UserTeam.destroy({
                where: { teamId }
            });

            // Then delete the team
            await team.destroy();

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting team:', error);
            return res.status(500).json({ error: 'Failed to delete team' });
        }
    },

    async removeTeamMember(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.teamId);
            const userId = parseInt(req.params.userId);

            const userTeam = await UserTeam.findOne({
                where: { teamId, userId }
            });

            if (!userTeam) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            await userTeam.destroy();

            return res.status(204).send();
        } catch (error) {
            console.error('Error removing team member:', error);
            return res.status(500).json({ error: 'Failed to remove team member' });
        }
    }
};
