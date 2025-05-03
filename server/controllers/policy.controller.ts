import type { Request, Response } from 'express';
import { RuleEffect } from '../types';
import { Policy, Rule, User, Project, Task, UserPolicy, ProjectPolicy, TaskPolicy } from '../models';

export const policyController = {
    // Get all policies
    async getAllPolicies(req: Request, res: Response) {
        try {
            const policies = await Policy.findAll({
                include: [
                    { model: Rule }
                ]
            });
            res.status(200).json(policies);
        } catch (error) {
            console.error('Error getting policies:', error);
            res.status(500).json({ error: 'Failed to retrieve policies' });
        }
    },

    // Get policy by ID
    async getPolicyById(req: Request, res: Response) {
        try {
            const policyId = parseInt(req.params.id);
            const policy = await Policy.findByPk(policyId, {
                include: [
                    { model: Rule },
                    { 
                        model: UserPolicy,
                        as: 'userAssignments',
                        include: [
                            { 
                                model: User,
                                attributes: ['id', 'name', 'email']
                            }
                        ]
                    },
                    {
                        model: ProjectPolicy,
                        as: 'projectAssignments',
                        include: [
                            {
                                model: Project,
                                attributes: ['id', 'name']
                            }
                        ]
                    },
                    {
                        model: TaskPolicy,
                        as: 'taskAssignments',
                        include: [
                            {
                                model: Task,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            return res.status(200).json(policy);
        } catch (error) {
            console.error('Error getting policy:', error);
            return res.status(500).json({ error: 'Failed to retrieve policy' });
        }
    },

    // Create new policy
    async createPolicy(req: Request, res: Response) {
        try {
            const { name, description, isActive = true, rules = [] } = req.body;

            // Check if policy already exists
            const existingPolicy = await Policy.findOne({
                where: { name }
            });

            if (existingPolicy) {
                return res.status(400).json({ error: 'Policy with this name already exists' });
            }

            // Create policy using transaction to ensure all operations succeed or fail together
            const result = await Policy.sequelize!.transaction(async (t) => {
                // Create the policy
                const policy = await Policy.create({
                    name,
                    description,
                    isActive
                }, { transaction: t });

                // Create rules if provided
                if (rules.length > 0) {
                    const rulesToCreate = rules.map((rule: any) => ({
                        name: rule.name,
                        description: rule.description,
                        effect: rule.effect || RuleEffect.ALLOW,
                        subjectAttributes: rule.subjectAttributes,
                        resourceAttributes: rule.resourceAttributes,
                        actionAttributes: rule.actionAttributes,
                        environmentAttributes: rule.environmentAttributes,
                        condition: rule.condition,
                        priority: rule.priority || 0,
                        policyId: policy.id
                    }));

                    await Rule.bulkCreate(rulesToCreate, { transaction: t });
                }

                // Return the created policy with its rules
                return Policy.findByPk(policy.id, {
                    include: [{ model: Rule }],
                    transaction: t
                });
            });

            return res.status(201).json(result);
        } catch (error) {
            console.error('Error creating policy:', error);
            return res.status(500).json({ error: 'Failed to create policy' });
        }
    },

    // Update policy
    async updatePolicy(req: Request, res: Response) {
        try {
            const policyId = parseInt(req.params.id);
            const { name, description, isActive } = req.body;

            const policy = await Policy.findByPk(policyId);
            
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            // Update fields if provided
            if (name !== undefined) policy.name = name;
            if (description !== undefined) policy.description = description;
            if (isActive !== undefined) policy.isActive = isActive;

            await policy.save();

            return res.status(200).json(policy);
        } catch (error) {
            console.error('Error updating policy:', error);
            return res.status(500).json({ error: 'Failed to update policy' });
        }
    },

    // Delete policy
    async deletePolicy(req: Request, res: Response) {
        try {
            const policyId = parseInt(req.params.id);
            
            const policy = await Policy.findByPk(policyId);
            
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            
            await policy.destroy();
            
            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting policy:', error);
            return res.status(500).json({ error: 'Failed to delete policy' });
        }
    },

    // Add rule to policy
    async addRuleToPolicy(req: Request, res: Response) {
        try {
            const policyId = parseInt(req.params.id);
            const {
                name,
                description,
                effect,
                subjectAttributes,
                resourceAttributes,
                actionAttributes,
                environmentAttributes,
                condition,
                priority
            } = req.body;

            // Check if policy exists
            const policy = await Policy.findByPk(policyId);
            
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            // Create the rule
            const rule = await Rule.create({
                name,
                description,
                effect: effect || RuleEffect.ALLOW,
                subjectAttributes,
                resourceAttributes,
                actionAttributes,
                environmentAttributes,
                condition,
                priority: priority || 0,
                policyId
            });

            return res.status(201).json(rule);
        } catch (error) {
            console.error('Error adding rule to policy:', error);
            return res.status(500).json({ error: 'Failed to add rule to policy' });
        }
    },

    // Assign policy to user
    async assignPolicyToUser(req: Request, res: Response) {
        try {
            const { policyId, userId, expiresAt } = req.body;

            // Check if policy and user exist
            const [policy, user] = await Promise.all([
                Policy.findByPk(policyId),
                User.findByPk(userId)
            ]);

            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create the user policy assignment
            const userPolicy = await UserPolicy.create({
                userId,
                policyId,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            });

            // Fetch with associations for response
            const userPolicyWithDetails = await UserPolicy.findByPk(userPolicy.id, {
                include: [
                    { model: User },
                    { model: Policy }
                ]
            });

            return res.status(201).json(userPolicyWithDetails);
        } catch (error) {
            console.error('Error assigning policy to user:', error);
            return res.status(500).json({ error: 'Failed to assign policy to user' });
        }
    },

    // Assign policy to project
    async assignPolicyToProject(req: Request, res: Response) {
        try {
            const { policyId, projectId } = req.body;

            // Check if policy and project exist
            const [policy, project] = await Promise.all([
                Policy.findByPk(policyId),
                Project.findByPk(projectId)
            ]);

            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Create the project policy assignment
            const projectPolicy = await ProjectPolicy.create({
                projectId,
                policyId
            });

            // Fetch with associations for response
            const projectPolicyWithDetails = await ProjectPolicy.findByPk(projectPolicy.id, {
                include: [
                    { model: Project },
                    { model: Policy }
                ]
            });

            return res.status(201).json(projectPolicyWithDetails);
        } catch (error) {
            console.error('Error assigning policy to project:', error);
            return res.status(500).json({ error: 'Failed to assign policy to project' });
        }
    },

    // Assign policy to task
    async assignPolicyToTask(req: Request, res: Response) {
        try {
            const { policyId, taskId } = req.body;

            // Check if policy and task exist
            const [policy, task] = await Promise.all([
                Policy.findByPk(policyId),
                Task.findByPk(taskId)
            ]);

            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Create the task policy assignment
            const taskPolicy = await TaskPolicy.create({
                taskId,
                policyId
            });

            // Fetch with associations for response
            const taskPolicyWithDetails = await TaskPolicy.findByPk(taskPolicy.id, {
                include: [
                    { model: Task },
                    { model: Policy }
                ]
            });

            return res.status(201).json(taskPolicyWithDetails);
        } catch (error) {
            console.error('Error assigning policy to task:', error);
            return res.status(500).json({ error: 'Failed to assign policy to task' });
        }
    }
};