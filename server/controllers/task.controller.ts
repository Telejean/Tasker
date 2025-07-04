import type { Request, Response } from 'express';
import { Task } from '../models/Task.model';
import { Project } from '../models/Project.model';
import { AssignedPerson } from '../models/AssignedPerson.model';
import { User } from '../models/User.model';
import { Team } from '../models/Team.model';
import { UserTeam } from '../models/UserTeam.model';
import { Op } from 'sequelize';

export const taskController = {
    async getAllTasks(req: Request, res: Response) {
        try {
            const tasks = await Task.findAll({
                include: [
                    {
                        model: Project,
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    }
                ]
            });

            const flattenedTasks = tasks.map(task => {
                const t = task.toJSON();
                t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);
                return t;
            });

            return res.status(200).json(flattenedTasks);
        } catch (error) {
            console.error('Error getting tasks:', error);
            return res.status(500).json({ error: 'Failed to retrieve tasks' });
        }
    },

    async getTaskById(req: Request, res: Response) {
        try {
            const taskId = parseInt(req.params.id);

            const task = await Task.findByPk(taskId, {
                include: [
                    {
                        model: Project,
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    }
                ]
            });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const t = task.toJSON();
            t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);

            return res.status(200).json(t);
        } catch (error) {
            console.error('Error getting task:', error);
            return res.status(500).json({ error: 'Failed to retrieve task' });
        }
    },

    async createTask(req: Request, res: Response) {
        try {
            const { name, description, creatorId, deadline, projectId, priority, status = "NOT_STARTED" } = req.body;
            const assignedUserIds = req.body.assignedPeople || [];

            const task = await Task.create({
                name,
                description,
                creatorId,
                deadline: deadline,
                status,
                projectId,
                priority
            });

            if (assignedUserIds && assignedUserIds.length > 0) {
                const assignedPeople = assignedUserIds.map((userId: number) => ({
                    taskId: task.id,
                    userId
                }));

                await AssignedPerson.bulkCreate(assignedPeople);
            }

            const createdTaskWithAssociations = await Task.findByPk(task.id, {
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    }
                ]
            });

            const t = createdTaskWithAssociations?.toJSON();
            if (t) {
                t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);
            }

            return res.status(201).json(t);
        } catch (error) {
            console.error('Error creating task:', error);
            return res.status(500).json({ error: 'Failed to create task' });
        }
    },


    async bulkCreateTasks(req: Request, res: Response) {
        try {
            const { tasks } = req.body;

            if (!Array.isArray(tasks) || tasks.length === 0) {
                return res.status(400).json({ error: 'A non-empty array of tasks is required' });
            }

            const result = await Task.sequelize!.transaction(async (t) => {
                const createdTasks = await Task.bulkCreate(
                    tasks.map(task => ({
                        name: task.name,
                        description: task.description,
                        deadline: task.deadline ? new Date(task.deadline) : null,
                        status: task.status || "NOT_STARTED",
                        projectId: task.projectId
                    })),
                    { transaction: t }
                );

                const assignedPersonPromises = [];

                for (let i = 0; i < tasks.length; i++) {
                    const task = tasks[i];
                    const createdTask = createdTasks[i];

                    if (task.assignedUserIds && task.assignedUserIds.length > 0) {
                        const assignedPeople = task.assignedUserIds.map((userId: number) => ({
                            taskId: createdTask.id,
                            userId
                        }));

                        assignedPersonPromises.push(
                            AssignedPerson.bulkCreate(assignedPeople, { transaction: t })
                        );
                    }
                }

                await Promise.all(assignedPersonPromises);

                return createdTasks.map(task => task.id);
            });

            const createdTasksWithAssociations = await Task.findAll({
                where: {
                    id: {
                        [Op.in]: result
                    }
                },
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    }
                ]
            });

            return res.status(201).json(createdTasksWithAssociations);
        } catch (error) {
            console.error('Error bulk creating tasks:', error);
            return res.status(500).json({ error: 'Failed to bulk create tasks' });
        }
    },

    async updateTask(req: Request, res: Response) {
        try {
            const taskId = parseInt(req.params.id);
            const { name, description, deadline, status, assignedUserIds } = req.body;

            const taskExists = await Task.findByPk(taskId);
            if (!taskExists) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (deadline !== undefined) updateData.deadline = new Date(deadline);
            if (status !== undefined) updateData.status = status;

            await Task.update(updateData, {
                where: { id: taskId }
            });

            if (assignedUserIds) {
                await AssignedPerson.destroy({
                    where: { taskId }
                });

                if (assignedUserIds.length > 0) {
                    const assignedPeople = assignedUserIds.map((userId: number) => ({
                        taskId,
                        userId
                    }));

                    await AssignedPerson.bulkCreate(assignedPeople);
                }
            }

            const updatedTask = await Task.findByPk(taskId, {
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    }
                ]
            });

            return res.status(200).json(updatedTask);
        } catch (error) {
            console.error('Error updating task:', error);
            return res.status(500).json({ error: 'Failed to update task' });
        }
    },

    async deleteTask(req: Request, res: Response) {
        try {
            const taskId = parseInt(req.params.id);

            const taskExists = await Task.findByPk(taskId);
            if (!taskExists) {
                return res.status(404).json({ error: 'Task not found' });
            }

            await Task.destroy({
                where: { id: taskId }
            });

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting task:', error);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
    },

    async getMyTasks(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const assignedTaskIds = await AssignedPerson.findAll({
                where: { userId },
                attributes: ['taskId'],
                raw: true
            }).then(assignments => assignments.map(a => a.taskId));

            const tasks = await Task.findAll({
                where: {
                    id: {
                        [Op.in]: assignedTaskIds
                    }
                },
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [
                    ['deadline', 'ASC']
                ]
            });

            const flattenedTasks = tasks.map(task => {
                const t = task.toJSON();
                t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);
                return t;
            });

            return res.status(200).json(flattenedTasks);
        } catch (error) {
            console.error('Error getting user tasks:', error);
            return res.status(500).json({ error: 'Failed to retrieve tasks' });
        }
    },

    async getTasksByProject(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id
            const projectId = parseInt(req.params.id);

            const teams = await Team.findAll({
                where: { projectId },
                include: [{
                    model: User,
                    through: {
                        where: { userId }
                    }
                }]
            });

            const project = await Project.findByPk(projectId, { raw: true });

            const tasks = await Task.findAll({
                where: { projectId },
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [
                    ['deadline', 'ASC']
                ]
            });

            const flattenedTasks = tasks.map(task => {
                const t = task.toJSON();
                t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);
                return t;
            });

            return res.status(200).json(flattenedTasks);
        } catch (error) {
            console.error('Error getting project tasks:', error);
            return res.status(500).json({ error: 'Failed to retrieve tasks' });
        }
    },

    async addUserToTask(req: Request, res: Response) {
        try {

            const taskId = parseInt(req.params.id);
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            const task = await Task.findByPk(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const existingAssignment = await AssignedPerson.findOne({
                where: {
                    taskId,
                    userId
                }
            });

            if (existingAssignment) {
                return res.status(409).json({ error: 'User is already assigned to this task' });
            }

            await AssignedPerson.create({
                taskId,
                userId
            });

            const updatedTask = await Task.findByPk(taskId, {
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['team', 'createdAt', 'updatedAt'] },
                            }
                        ]
                    },
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            const t = updatedTask?.toJSON();
            if (t) {
                t.assignedUsers = (t.assignedUsers || []).map((ap: any) => ap.user);
            }

            return res.status(200).json(t);
        } catch (error) {
            console.error('Error adding user to task:', error);
            return res.status(500).json({ error: 'Failed to add user to task' });
        }
    },
};