import type { Request, Response } from 'express';
import { Project, User, Task, Team, UserTeam, UserProject } from '../models';
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
                    },
                    {
                        model: User,
                        as: 'users',
                        through: { attributes: [] },
                        attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                    }
                ]
            });
            return res.status(200).json(projects);
        } catch (error) {
            console.error('Error getting projects:', error);
            return res.status(500).json({ error: 'Failed to retrieve projects' });
        }
    },

    async getProjectById(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);
            let project = await Project.findByPk(projectId, {
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
                    },
                    {
                        model: User,
                        as: 'members',
                        through: { attributes: ['role'] },
                        attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                    }
                ]
            });



            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            project = project.get({ plain: true }) as Project;

            project.members = project.members.map((member: any) => {
                const { UserProject, ...rest } = member;
                return { ...rest, role: UserProject.role };
            })


            return res.status(200).json(project);
        } catch (error) {
            console.error('Error getting project:', error);
            return res.status(500).json({ error: 'Failed to retrieve project' });
        }
    },

    async createProject(req: Request, res: Response) {
        try {
            const { name, managerId, userIds, iconId = 1, icon, status = "ACTIVE" } = req.body;


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

        } catch (error) {
            console.error('Error creating project:', error);
            return res.status(500).json({ error: 'Failed to create project' });
        }
    },

    async updateProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);
            const { name, status, iconId, icon, userIds } = req.body;

            const project = await Project.findByPk(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            if (name !== undefined) project.name = name;
            if (status !== undefined) project.status = status;
            if (iconId !== undefined) project.iconId = iconId;
            if (icon !== undefined) project.icon = icon;

            await project.save();

            if (userIds && userIds.length >= 0) {
                const defaultTeam = await Team.findOne({
                    where: { projectId }
                });

                if (defaultTeam) {
                    const currentUserTeams = await UserTeam.findAll({
                        where: {
                            teamId: defaultTeam.id,
                            userRole: { [Op.ne]: 'OWNER' }
                        }
                    });

                    const currentUserIds = currentUserTeams.map(ut => ut.userId);

                    const usersToRemove = currentUserIds.filter(id => !userIds.includes(id));
                    const usersToAdd = userIds.filter((id: number) => !currentUserIds.includes(id));

                    if (usersToRemove.length > 0) {
                        await UserTeam.destroy({
                            where: {
                                teamId: defaultTeam.id,
                                userId: usersToRemove,
                                userRole: { [Op.ne]: 'OWNER' }
                            }
                        });
                    }

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
                                attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'users',
                        through: { attributes: [] },
                        attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
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
                                    attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'users',
                            through: { attributes: ['role'] },
                            attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                        }
                    ],
                    order: [
                        ['createdAt', 'DESC']
                    ]
                });

                return res.status(200).json(projects);
            }

            let projects = await Project.findAll({
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                    },
                    {
                        model: Team,
                        include: [
                            {
                                model: User,
                                through: {
                                    where: { userId: userId }
                                },
                                attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'members',
                        through: { attributes: ['role'] },
                        attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                    }
                ],
                where: {
                    [Op.or]: [
                        { managerId: userId }
                    ]
                },
                order: [
                    ['createdAt', 'DESC']
                ]
            });

            projects = projects.map(p => p.get({ plain: true }));


            projects = projects.map((project: Project) => {
                project.members = project.members.map((member: any) => {
                    const { UserProject, ...rest } = member;
                    return { ...rest, role: UserProject.role };
                })
                return project;
            })

            return res.status(200).json(projects);
        } catch (error) {
            console.error('Error getting user projects:', error);
            return res.status(500).json({ error: 'Failed to retrieve projects' });
        }
    }
};