import type { Request, Response } from 'express';
import { TaskStatus } from '../types';
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
                        as: 'assignedPeople',
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });
            return res.status(200).json(tasks);
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
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    }
                ]
            });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            return res.status(200).json(task);
        } catch (error) {
            console.error('Error getting task:', error);
            return res.status(500).json({ error: 'Failed to retrieve task aaaaaaaaaaaa' });
        }
    },

    async createTask(req: Request, res: Response) {
        try {
            const { name, description, deadline, projectId, assignedUserIds, status = TaskStatus.NOT_STARTED } = req.body;

            // Create the task
            const task = await Task.create({
                name,
                description,
                deadline: new Date(deadline),
                status,
                projectId
            });

            // Create the assigned user relations
            if (assignedUserIds && assignedUserIds.length > 0) {
                const assignedPeople = assignedUserIds.map((userId: number) => ({
                    taskId: task.id,
                    userId
                }));

                await AssignedPerson.bulkCreate(assignedPeople);
            }

            // Fetch the complete task with associations
            const createdTaskWithAssociations = await Task.findByPk(task.id, {
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        as: 'assignedPeople',
                        include: [
                            {
                                model: User
                            }
                        ]
                    }
                ]
            });

            return res.status(201).json(createdTaskWithAssociations);
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

            // Use a transaction to ensure all operations succeed or fail together
            const result = await Task.sequelize!.transaction(async (t) => {
                // Create all tasks
                const createdTasks = await Task.bulkCreate(
                    tasks.map(task => ({
                        name: task.name,
                        description: task.description,
                        deadline: task.deadline ? new Date(task.deadline) : null,
                        status: task.status || TaskStatus.NOT_STARTED,
                        projectId: task.projectId
                    })),
                    { transaction: t }
                );

                // Create assigned persons for each task
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

                // Return the created tasks with their IDs
                return createdTasks.map(task => task.id);
            });

            // Fetch all created tasks with their associations
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
                        as: 'assignedPeople',
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'email']
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

            // Check if task exists
            const taskExists = await Task.findByPk(taskId);
            if (!taskExists) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Update task fields
            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (deadline !== undefined) updateData.deadline = new Date(deadline);
            if (status !== undefined) updateData.status = status;

            await Task.update(updateData, {
                where: { id: taskId }
            });

            // Update assigned users if provided
            if (assignedUserIds) {
                // Delete existing assignments
                await AssignedPerson.destroy({
                    where: { taskId }
                });

                // Create new assignments
                if (assignedUserIds.length > 0) {
                    const assignedPeople = assignedUserIds.map((userId: number) => ({
                        taskId,
                        userId
                    }));

                    await AssignedPerson.bulkCreate(assignedPeople);
                }
            }

            // Fetch updated task with associations
            const updatedTask = await Task.findByPk(taskId, {
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        as: 'assignedPeople',
                        include: [
                            {
                                model: User
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

            // Check if task exists
            const taskExists = await Task.findByPk(taskId);
            if (!taskExists) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Delete the task (associated records will be deleted due to cascade constraints)
            await Task.destroy({
                where: { id: taskId }
            });

            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting task:', error);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
    },

    // Get tasks assigned to the current user
    async getMyTasks(req: Request, res: Response) {
        try {
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const tasks = await Task.findAll({
                include: [
                    {
                        model: Project
                    },
                    {
                        model: AssignedPerson,
                        where: { userId },
                        required: true,
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

            return res.status(200).json(tasks);
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

            const project = await Project.findByPk(projectId, {raw:true});
            console.log()
            console.log()
            console.log()
            console.log()
            console.log({projectManagerId: project?.managerId, userId, adevar:project?.managerId===userId})
            console.log()
            console.log()
            console.log()
            console.log()

            const isProjectManager = project && project.managerId === userId;

            const user = req.user as any;

            if (teams.length === 0 && !isProjectManager) {
                return res.status(403).json({
                    error: 'You do not have access to this project'
                });
            }

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

            return res.status(200).json(tasks);
        } catch (error) {
            console.error('Error getting project tasks:', error);
            return res.status(500).json({ error: 'Failed to retrieve tasks' });
        }
    }
};