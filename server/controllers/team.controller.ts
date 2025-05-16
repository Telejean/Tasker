import type { Request, Response } from 'express';
import { Team, User, UserTeam, Project, Department } from '../models';
import { Op } from 'sequelize';

/**
*    removes the nested UserRole and adds it at the same level as the rest of the properties
**/
const teamFlattenUtil = (team: Team) => {
    const teamJson = team.toJSON();
    teamJson.users = teamJson.users.map((user: any) => ({
        ...user,
        userRole: user.UserTeam?.userRole,
        assignedAt: user.UserTeam?.assignedAt,
    }));
    teamJson.users.forEach((user: any) => delete user.UserTeam);

    return teamJson;
}

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
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Department,
                                attributes: ['id', 'departmentName']
                            }
                        ]
                    }
                ]
            });
            // Flatten UserTeam and include department
            const teamsWithFlatUsers = teams.map(team => teamFlattenUtil(team));
            return res.status(200).json(teamsWithFlatUsers);
        } catch (error) {
            console.error('Error getting teams:', error);
            return res.status(500).json({ error: 'Failed to retrieve teams' });
        }
    },

    async getTeamById(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.id);
            const team = await Team.findByPk(teamId, {
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
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Department,
                                attributes: ['id', 'departmentName']
                            }
                        ]
                    }
                ]
            });

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            const teamWithFlatUsers = teamFlattenUtil(team);
            return res.status(200).json(teamWithFlatUsers);
        } catch (error) {
            console.error('Error getting team:', error);
            return res.status(500).json({ error: 'Failed to retrieve team' });
        }
    },

    async getTeamsByProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.projectId);
            const teams = await Team.findAll({
                where: { projectId },
                include: [
                    {
                        model: User,
                        through: {
                            attributes: ['userRole', 'assignedAt']
                        },
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Department,
                                attributes: ['id', 'departmentName']
                            }
                        ]
                    }
                ]
            });

            const teamsWithFlatUsers = teams.map(team => teamFlattenUtil(team));
            return res.status(200).json(teamsWithFlatUsers);
        } catch (error) {
            console.error('Error getting project teams:', error);
            return res.status(500).json({ error: 'Failed to retrieve teams' });
        }
    },

    async createTeam(req: Request, res: Response) {
        try {
            const { name, projectId, userIds = [], userRoles = {} } = req.body;

            const team = await Team.create({
                name,
                projectId
            });

            if (userIds.length > 0) {
                const userTeams = userIds.map((userId: number) => ({
                    userId,
                    teamId: team.id,
                    userRole: userRoles[userId] || "MEMBER"
                }));

                await UserTeam.bulkCreate(userTeams);
            }

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
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Department,
                                attributes: ['id', 'departmentName']
                            }
                        ]
                    }
                ]
            });
            if (createdTeam) {
                const teamWithFlatUsers = teamFlattenUtil(createdTeam);
                return res.status(201).json(teamWithFlatUsers);
            } else res.status(501).json({ error: "Failed to retrieve created team" })
        } catch (error) {
            console.error('Error creating team:', error);
            return res.status(500).json({ error: 'Failed to create team' });
        }
    },

    async updateTeam(req: Request, res: Response) {
        try {
            const teamId = parseInt(req.params.id);
            const { name, userIds, userRoles = {} } = req.body;

            const team = await Team.findByPk(teamId);

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            if (name !== undefined) team.name = name;

            await team.save();
            if (userIds && userIds.length >= 0) {
                const currentUserTeams = await UserTeam.findAll({
                    where: {
                        teamId,
                        userRole: { [Op.ne]: 'OWNER' }
                    },
                    raw: true
                });

                const currentUserIds = currentUserTeams.map(ut => ut.userId);

                const usersToRemove = currentUserIds.filter(id => !userIds.includes(id));
                const usersToAdd = userIds.filter((id: number) => !currentUserIds.includes(id));

                if (usersToRemove.length > 0) {
                    await UserTeam.destroy({
                        where: {
                            teamId,
                            userId: usersToRemove,
                            userRole: { [Op.ne]: 'OWNER' }
                        }
                    });
                }

                if (usersToAdd.length > 0) {
                    const newUserTeams = usersToAdd.map((userId: number) => ({
                        userId,
                        teamId,
                        userRole: userRoles[userId] || 'MEMBER'
                    }));

                    await UserTeam.bulkCreate(newUserTeams);
                }

                const usersToUpdate = userIds.filter((id: number) => currentUserIds.includes(id));
                for (const userId of usersToUpdate) {
                    if (userRoles[userId]) {
                        await UserTeam.update(
                            { userRole: userRoles[userId] },
                            { where: { teamId, userId } }
                        );
                    }
                }
            }

            const updatedTeam = await Team.findByPk(teamId, {
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
                        attributes: ['id', 'name', 'email'],
                        include: [
                            {
                                model: Department,
                                attributes: ['id', 'departmentName']
                            }
                        ]
                    }
                ]
            });

            if (updatedTeam != null) {
                const teamWithFlatUsers = teamFlattenUtil(updatedTeam);
                return res.status(200).json(teamWithFlatUsers);
            } else {
                return res.status(404).json({error: "Failed to retrive updated team"})
            }

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
