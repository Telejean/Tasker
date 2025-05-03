import type { Request, Response } from 'express';
import { Project, User, Task, ProjectMember } from '../models';
import { ProjectStatus } from '../types';
import { Op } from 'sequelize';

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
                        model: User,
                        as: 'users',
                        attributes: ['id', 'name', 'email'],
                        through: { attributes: [] } // Excludes join table attributes
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
    },

    async getProjectById(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);
            const project = await Project.findByPk(projectId, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'users',
                        attributes: ['id', 'name', 'email'],
                        through: { attributes: [] }
                    },
                    {
                        model: Task,
                        include: [
                            {
                                model: User,
                                as: 'assignedUsers',
                                through: { attributes: [] }
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
    },

    async createProject(req: Request, res: Response) {
        try {
            const { name, managerId, userIds = [], iconId = 1, status = ProjectStatus.ACTIVE } = req.body;

            // Create the project with the manager association
            const project = await Project.create({
                name,
                iconId,
                status,
                managerId,
                userIds
            });



            // Fetch the complete project with associations
            const createdProject = await Project.findByPk(project.id, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'users',
                        attributes: ['id', 'name', 'email'],
                        through: { attributes: [] }
                    }
                ]
            });

            return res.status(201).json(createdProject);
        } catch (error) {
            console.error('Error creating project:', error);
            return res.status(500).json({ error: 'Failed to create project' });
        }
    },

    async updateProject(req: Request, res: Response) {
        try {
            const projectId = parseInt(req.params.id);
            const { name, status, iconId, userIds } = req.body;

            // Find the project by ID
            const project = await Project.findByPk(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Update project fields
            if (name !== undefined) project.name = name;
            if (status !== undefined) project.status = status;
            if (iconId !== undefined) project.iconId = iconId;

            // Save the changes
            await project.save();

            // Update users if provided

            // Fetch the updated project with associations
            const updatedProject = await Project.findByPk(projectId, {
                include: [
                    {
                        model: User,
                        as: 'manager',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: User,
                        as: 'users',
                        attributes: ['id', 'name', 'email'],
                        through: { attributes: [] }
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
    }
};