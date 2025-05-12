import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
// Fix import for Task - it uses CommonJS module exports
import { Task } from '../models/Task.model';
import { AssignedPerson } from '../models/AssignedPerson.model';
import { UserRoles } from '../types';
// Fix import for sequelize - it uses default export
import sequelize from '../utils/sequelize';
import { createUserService } from '../services/user.service';

export const userController = {


    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await User.findAll({
                include: [
                    {
                        model: AssignedPerson,
                        include: [{ model: Task, include: [Project] }]
                    }
                ]
            });
            return res.status(200).json(users);
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
                include: [
                    {
                        model: AssignedPerson,
                        include: [{ model: Task, include: [Project] }]
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
                role: req.body.role || UserRoles.MEMBER,
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

            // Use Sequelize transaction for bulk creation
            const transaction = await sequelize.transaction();

            try {
                const userData = users.map(user => {
                    const { name, surname, phoneNumber,  email, role  } = user;
                    return { name, surname, phoneNumber, email, role };
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

            // Handle Sequelize unique constraint error
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
    }
};