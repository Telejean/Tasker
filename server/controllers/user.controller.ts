import { Request, Response } from 'express';
import { User } from '../models/User';
import { Project } from '../models/Project';
// Fix import for Task - it uses CommonJS module exports
import {Task}  from '../models/Task';
import { AssignedPerson } from '../models/AssignedPerson';
import { UserRoles } from '../types';
// Fix import for sequelize - it uses default export
import sequelize from '../utils/sequelize';

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

            // Convert to plain objects and sanitize password if it exists
            const sanitizedUsers = users.map(user => {
                const plainUser = user.get({ plain: true });
                if ('password' in plainUser) {
                    const { password, ...userWithoutPassword } = plainUser;
                    return userWithoutPassword;
                }
                return plainUser;
            });

            return res.status(200).json(sanitizedUsers);
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

            // Remove password if it exists
            if ('password' in plainUser) {
                const { password, ...userWithoutPassword } = plainUser;
                return res.status(200).json(userWithoutPassword);
            }

            return res.status(200).json(plainUser);
        } catch (error) {
            console.error('Error getting user:', error);
            return res.status(500).json({ error: 'Failed to retrieve user' });
        }
    },

    async createUser(req: Request, res: Response) {
        try {
            const { name, email, password, role = UserRoles.MEMBER } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: {
                        name: !name ? 'Name is required' : null,
                        email: !email ? 'Email is required' : null,
                        password: !password ? 'Password is required' : null
                    }
                });
            }

            const user = await User.create({
                name,
                email,
                password,
                role
            });

            const plainUser = user.get({ plain: true });

            if ('password' in plainUser) {
                const { password: _, ...userWithoutPassword } = plainUser;
                return res.status(201).json(userWithoutPassword);
            }

            return res.status(201).json(plainUser);
        } catch (error) {
            console.error('Error creating user:', error);

            return res.status(500).json({
                error: 'Unexpected error while creating user',
                details: error instanceof Error ? error.message : 'Unknown error'
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
                const { name, email, password } = user;
                if (!name || !email || !password) {
                    return {
                        index,
                        errors: {
                            name: !name ? 'Name is required' : null,
                            email: !email ? 'Email is required' : null,
                            password: !password ? 'Password is required' : null
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
                    const { name, email, password, role = UserRoles.MEMBER } = user;
                    return { name, email, password, role };
                });

                const createdUsers = await User.bulkCreate(userData, {
                    transaction,
                    // Exclude password from the returned objects
                    fields: ['id', 'name', 'email', 'role'],
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