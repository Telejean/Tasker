import type { Request, Response } from 'express';
import { Project, User, Task, Team, UserTeam, UserProject } from '../models';
import { ProjectStatus } from '../types';
import { Op } from 'sequelize';
import sequelize from '../utils/sequelize';

export const projectController = {
    async getAllProjects(req: Request, res: Response) {
        try {
            const projects = await Project.findAll({
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: { attributes: [] },
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: Task
                    }
                ]
            });
            return res.status(200).json(projects);
        } catch (error) {
            console.error('Error getting projects:', error);
            return res.status(500).json({ error: 'Failed to retrieve projects' });
        }
    }, async getProjectById(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id); const project = await Project.findByPk(projectId, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: { attributes: [] },
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: Task,
                        include: [
                            {
                                model: User,
                            }
                        ]
                    }
                ]
            });

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.status(200).json(project);
        } catch (error) {
            console.error('Error getting project:', error);
            return res.status(500).json({ error: 'Failed to retrieve project' });
        }
    }, async createProject(req: Request, res: Response) {
        try {
            const { name, managerId, userIds, iconId = 1, icon, status = ProjectStatus.ACTIVE } = req.body;
            console.log(userIds);


            const project = await Project.create({
                name,
                iconId,
                icon,
                status,
                managerId
            });


            const createdProject = await Project.findByPk(project.id, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: { attributes: [] },
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });

            const transaction = await sequelize.transaction();
            try {
                const userProjects = userIds.map((u: number) => { return { userId: u, projectId: project.id } });
                const createdUserProjects = await UserProject.bulkCreate(userProjects, {
                    transaction,
                    returning: true
                })
                await transaction.commit()

                return res.status(201).json({
                    message: `Successfully created ${createdUserProjects.length} users`,
                    users: createdUserProjects.map(user => user.get({ plain: true }))
                });

            } catch (txError) {
                await transaction.rollback();
                throw txError;
            }

            return res.status(201).json(createdProject);
        } catch (error) {
            console.error('Error creating project:', error);
            return res.status(500).json({ error: 'Failed to create project' });
        }
    }, async updateProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);
            const { name, status, iconId, icon, userIds } = req.body;

            // Find the project by ID
            const project = await Project.findByPk(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Update project fields
            if (name !== undefined) project.name = name;
            if (status !== undefined) project.status = status;
            if (iconId !== undefined) project.iconId = iconId;
            if (icon !== undefined) project.icon = icon;

            // Save the changes
            await project.save();

            // Update users in the default team if provided
            if (userIds && userIds.length >= 0) {
                // Find the default team
                const defaultTeam = await Team.findOne({
                    where: { projectId }
                });

                if (defaultTeam) {
                    // Get current team members excluding the owner
                    const currentUserTeams = await UserTeam.findAll({
                        where: {
                            teamId: defaultTeam.id,
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
                                teamId: defaultTeam.id,
                                userId: usersToRemove,
                                userRole: { [Op.ne]: 'OWNER' } // Don't remove owner
                            }
                        });
                    }

                    // Add new users to the team
                    if (usersToAdd.length > 0) {
                        const newUserTeams = usersToAdd.map((userId: number) => ({
                            userId,
                            teamId: defaultTeam.id,
                            userRole: 'MEMBER'
                        }));

                        await UserTeam.bulkCreate(newUserTeams);
                    }
                }
            }

            // Fetch the updated project with associations
            const updatedProject = await Project.findByPk(projectId, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: { attributes: [] },
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });

            return res.status(200).json(updatedProject);
        } catch (error) {
            console.error('Error updating project:', error);
            return res.status(500).json({ error: 'Failed to update project' });
        }
    },

    async deleteProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);

            const project = await Project.findByPk(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            await project.destroy();

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting project:', error);
            return res.status(500).json({ error: 'Failed to delete project' });
        }
    },
    async getMyProjects(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id;
            const user = (req.user as any);

            if (user.isAdmin) {
                const projects = await Project.findAll({
                    include: [
                        {
                            model: User,
                            as: 'manager',
                            attributes: ['id', 'name', 'email']
                        },
                        {
                            model: Team,
                            include: [
                                {
                                    model: User,
                                    through: { attributes: [] },
                                    attributes: ['id', 'name', 'email']
                                }
                            ]
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                });

                return res.status(200).json(projects);
            }

            // For regular users, show only projects they're members of
            const projects = await Project.findAll({
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: {
                                    where: { userId: userId }
                                },
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ],
                where: {
                    [Op.or]: [
                        { managerId: userId } // Projects where user is the manager
                    ]
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            return res.status(200).json(projects);
        } catch (error) {
            console.error('Error getting user projects:', error);
            return res.status(500).json({ error: 'Failed to retrieve projects' });
        }
    }
};