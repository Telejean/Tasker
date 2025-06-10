import { Request, Response } from 'express';
import { Task } from '../models/Task.model';
import { AssignedPerson } from '../models/AssignedPerson.model';
import sequelize from '../utils/sequelize';
import { createUserService } from '../services/user.service';
import { UserProject, UserPolicy, PermissionLog, Policy, Team, Department, Project, User } from '../models';

export const userController = {


    async getAllUsers(req: Request, res: Response) {

        try {
            const users = await User.findAll({
                attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                include: [
                    {
                        model: AssignedPerson,
                        include: [{ model: Task, include: [Project] }]
                    },
                    {
                        model: Department,
                        attributes: ['id', 'departmentName']
                    }
                ],

            });

            // if (req.user) {
            //     const { id } = req.user as any;
            //     const parsedUsers = users.filter(u => u.id !== id);
            //     return res.status(200).json(parsedUsers);
            // }

            return res.status(200).json(users);
        } catch (error) {
            console.error('Error getting users:', error);

            return res.status(500).json({
                error: 'Unexpected error while retrieving users',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    async getUsersByProject(req: Request, res: Response) {
        try {
            const projectId = req.params.id;

            const users = await User.findAll({
                include: [
                    {
                        model: Project,
                        as: 'projects',
                        where: { id: projectId },
                        attributes: [],
                        through: { attributes: [] },
                    },
                    {
                        model: Department,
                        attributes: ['id', 'departmentName']
                    }
                ],
                attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] }
            });

            res.status(200).json(users);
        } catch (error) {
            console.error('Error getting users:', error);

            return res.status(500).json({
                error: 'Unexpected error while retrieving users',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    async getUserById(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    details: 'User ID must be a number'
                });
            }

            const user = await User.findByPk(userId, {
                attributes: { exclude: ["departmentId", "createdAt", "updatedAt"] },
                include: [
                    {
                        model: AssignedPerson,
                        include: [{ model: Task, include: [Project] }]
                    },
                    {
                        model: Department,
                        attributes: ['id', 'departmentName']
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const plainUser = user.get({ plain: true });


            return res.status(200).json(plainUser);
        } catch (error) {
            console.error('Error getting user:', error);
            return res.status(500).json({ error: 'Failed to retrieve user' });
        }
    },

    async createUser(req: Request, res: Response) {
        try {
            const userData = {
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                role: req.body.role || "MEMBER",
                tags: req.body.tags,
                bio: req.body.bio,
                departmentId: req.body.departmentId,
            };

            const newUser = await createUserService(userData);

            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);

            if (error instanceof Error && error.message.includes('Failed to validate user')) {
                return res.status(400).json({
                    message: error.message
                });
            }

            return res.status(500).json({
                message: 'An unexpected error occurred while creating user'
            });
        }
    },

    async createBulkUsers(req: Request, res: Response) {
        try {
            const users = req.body;
            if (!Array.isArray(users)) {
                return res.status(400).json({
                    error: 'Invalid input',
                    details: 'Request body must be an array of users'
                });
            }

            const invalidUsers = users.map((user, index) => {
                const { name, email } = user;
                if (!name || !email) {
                    return {
                        index,
                        errors: {
                            name: !name ? 'Name is required' : null,
                            email: !email ? 'Email is required' : null,
                        }
                    };
                }
                return null;
            }).filter(error => error !== null);

            if (invalidUsers.length > 0) {
                return res.status(400).json({
                    error: 'Invalid user data',
                    details: invalidUsers
                });
            }

            const transaction = await sequelize.transaction();

            try {
                const userData = users.map(user => {
                    const { name, surname, phoneNumber, email, role, departmentId } = user;
                    return { name, surname, phoneNumber, email, role, departmentId };
                });


                const createdUsers = await User.bulkCreate(userData, {
                    transaction,
                    returning: true
                });

                await transaction.commit();

                return res.status(201).json({
                    message: `Successfully created ${createdUsers.length} users`,
                    users: createdUsers.map(user => user.get({ plain: true }))
                });
            } catch (txError) {
                await transaction.rollback();
                throw txError;
            }
        } catch (error: any) {
            console.error('Error creating users in bulk:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    error: 'Duplicate email found',
                    details: 'One or more email addresses are already registered'
                });
            }

            return res.status(500).json({
                error: 'Failed to create users',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },

    async getFullUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'Invalid user ID',
                    details: 'User ID must be a number'
                });
            }

            const user = await User.findByPk(userId, {
                attributes: { exclude: ["departmentId"] },
                include: [
                    {
                        model: Department
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: Task,
                                include: [
                                    { model: Project }
                                ]
                            }
                        ]
                    },
                    {
                        model: Team,
                        through: {
                            attributes: ['userRole', 'createdAt']
                        },
                        include: [
                            {
                                model: Project,
                                attributes: ['id', 'name', 'icon', 'status']
                            }
                        ]
                    },
                    {
                        model: Project,
                        as: 'managedProjects',
                        include: [
                            {
                                model: Team,
                                attributes: ['id', 'name']
                            }
                        ]
                    },
                    {
                        model: UserPolicy,
                        include: [
                            { model: Policy }
                        ]
                    },
                    {
                        model: PermissionLog,
                        limit: 20,
                        order: [['createdAt', 'DESC']]
                    }
                ]
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const fullUserData = user.get({ plain: true });

            const assignedTasksCount = fullUserData.tasks?.length || 0;
            const teamsCount = fullUserData.teams?.length || 0;
            const managedProjectsCount = fullUserData.managedProjects?.length || 0;

            fullUserData.statistics = {
                assignedTasksCount,
                teamsCount,
                managedProjectsCount
            };

            return res.status(200).json(fullUserData);
        } catch (error) {
            console.error('Error retrieving full user data:', error);
            return res.status(500).json({
                error: 'Failed to retrieve complete user data',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    },
    
};