import { Request, Response } from 'express';
import { Policy } from '../models/Policy.model';
import { UserPolicy } from '../models/UserPolicy.model';
import { ProjectPolicy } from '../models/ProjectPolicy.model';
import { TaskPolicy } from '../models/TaskPolicy.model';
import { Rule } from '../models/Rule.model';
import { Op } from 'sequelize';

// Get the appropriate policy model based on resource type
const getPolicyModelForResource = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
        case 'user':
            return UserPolicy as any;
        case 'project':
            return ProjectPolicy as any;
        case 'task':
            return TaskPolicy as any;
        default:
            throw new Error(`Invalid resource type: ${resourceType}`);
    }
};

export const policyController = {
    // Get all policies or filter by active status
    async getPolicies(req: Request, res: Response) {
        try {
            const { active } = req.query;
            const where = active === 'true' ? { active: true } : {};

            const policies = await Policy.findAll({ where });
            res.json(policies);
        } catch (error) {
            console.error('Error fetching policies:', error);
            res.status(500).json({ message: 'Error fetching policies' });
        }
    },

    // Get a specific policy by ID
    async getPolicy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const policy = await Policy.findByPk(id);

            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            res.json(policy);
        } catch (error) {
            console.error('Error fetching policy:', error);
            res.status(500).json({ message: 'Error fetching policy' });
        }
    },

    // Create a new policy
    async createPolicy(req: Request, res: Response) {
        try {
            const { name, description, rules, active } = req.body;

            // Basic validation
            if (!name || !rules || !Array.isArray(rules)) {
                return res.status(400).json({ message: 'Name and rules array are required' });
            }

            const policy = await Policy.create({
                name,
                description,
                rules,
                active: active !== false, // Default to true if not specified
                createdBy: (req.user as any).id
            });

            res.status(201).json(policy);
        } catch (error) {
            console.error('Error creating policy:', error);
            res.status(500).json({ message: 'Error creating policy' });
        }
    },

    // Update an existing policy
    async updatePolicy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, description, rules, active } = req.body;

            const policy = await Policy.findByPk(id);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Update the policy fields
            await policy.update({
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(rules && { rules }),
                ...(active !== undefined && { active }),
                updatedBy: (req.user as any).id
            });

            res.json(policy);
        } catch (error) {
            console.error('Error updating policy:', error);
            res.status(500).json({ message: 'Error updating policy' });
        }
    },

    // Delete a policy
    async deletePolicy(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const policy = await Policy.findByPk(id);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Check if the policy is still in use
            const userCount = await UserPolicy.count({ where: { policyId: id } });
            const projectCount = await ProjectPolicy.count({ where: { policyId: id } });
            const taskCount = await TaskPolicy.count({ where: { policyId: id } });

            if (userCount > 0 || projectCount > 0 || taskCount > 0) {
                // Instead of deleting, deactivate the policy
                await policy.update({
                    active: false,
                    updatedBy: (req.user as any).id
                });

                return res.json({
                    message: 'Policy is still in use. It has been deactivated instead of deleted.',
                    policy
                });
            }

            // Actually delete if not in use
            await policy.destroy();
            res.json({ message: 'Policy deleted successfully' });
        } catch (error) {
            console.error('Error deleting policy:', error);
            res.status(500).json({ message: 'Error deleting policy' });
        }
    },

    // Assign a policy to a user
    async assignPolicyToUser(req: Request, res: Response) {
        try {
            const { policyId, userId, expiresAt } = req.body;

            // Check if policy exists
            const policy = await Policy.findByPk(policyId);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Create the assignment
            const assignment = await UserPolicy.create({
                policyId,
                userId,
                expiresAt: expiresAt || null,
                assignedBy: (req.user as any).id
            });

            res.status(201).json(assignment);
        } catch (error) {
            console.error('Error assigning policy to user:', error);
            res.status(500).json({ message: 'Error assigning policy to user' });
        }
    },

    // Assign a policy to a project
    async assignPolicyToProject(req: Request, res: Response) {
        try {
            const { policyId, projectId, expiresAt } = req.body;

            // Check if policy exists
            const policy = await Policy.findByPk(policyId);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Create the assignment
            const assignment = await ProjectPolicy.create({
                policyId,
                projectId,
                expiresAt: expiresAt || null,
                assignedBy: (req.user as any).id
            });

            res.status(201).json(assignment);
        } catch (error) {
            console.error('Error assigning policy to project:', error);
            res.status(500).json({ message: 'Error assigning policy to project' });
        }
    },

    // Assign a policy to a task
    async assignPolicyToTask(req: Request, res: Response) {
        try {
            const { policyId, taskId, expiresAt } = req.body;

            // Check if policy exists
            const policy = await Policy.findByPk(policyId);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Create the assignment
            const assignment = await TaskPolicy.create({
                policyId,
                taskId,
                expiresAt: expiresAt || null,
                assignedBy: (req.user as any).id
            });

            res.status(201).json(assignment);
        } catch (error) {
            console.error('Error assigning policy to task:', error);
            res.status(500).json({ message: 'Error assigning policy to task' });
        }
    },

    // Get policy assignments for a specific resource
    async getPolicyAssignments(req: Request, res: Response) {
        try {
            const { resourceType, resourceId } = req.params;

            if (!['user', 'project', 'task'].includes(resourceType.toLowerCase())) {
                return res.status(400).json({ message: 'Invalid resource type' });
            }

            const PolicyModel = getPolicyModelForResource(resourceType);
            const resourceIdField = `${resourceType.toLowerCase()}Id`;

            const assignments = await PolicyModel.findAll({
                where: { [resourceIdField]: resourceId },
                include: [{ model: Policy }]
            });

            res.json(assignments);
        } catch (error) {
            console.error(`Error fetching ${req.params.resourceType} policy assignments:`, error);
            res.status(500).json({ message: `Error fetching policy assignments` });
        }
    },

    // Remove a policy assignment
    async removePolicyAssignment(req: Request, res: Response) {
        try {
            const { resourceType, assignmentId } = req.params;

            if (!['user', 'project', 'task'].includes(resourceType.toLowerCase())) {
                return res.status(400).json({ message: 'Invalid resource type' });
            }

            const PolicyModel = getPolicyModelForResource(resourceType);
            const assignment = await PolicyModel.findByPk(assignmentId);

            if (!assignment) {
                return res.status(404).json({ message: 'Policy assignment not found' });
            }

            await assignment.destroy();
            res.json({ message: 'Policy assignment removed successfully' });
        } catch (error) {
            console.error('Error removing policy assignment:', error);
            res.status(500).json({ message: 'Error removing policy assignment' });
        }
    },

    // Add a rule to an existing policy
    async addRuleToPolicy(req: Request, res: Response) {
        try {
            const { policyId } = req.params;
            const { rule } = req.body;

            // Basic validation
            if (!rule || typeof rule !== 'object') {
                return res.status(400).json({
                    message: 'A valid rule object is required'
                });
            }

            // Check required rule properties
            if (!rule.name || !rule.effect) {
                return res.status(400).json({
                    message: 'Rule must contain name and effect properties'
                });
            }

            // Find the policy
            const policy = await Policy.findByPk(policyId);
            if (!policy) {
                return res.status(404).json({ message: 'Policy not found' });
            }

            // Create the new rule
            const newRule = await Rule.create({
                name: rule.name,
                description: rule.description || null,
                effect: rule.effect,
                subjectAttributes: rule.subjectAttributes || null,
                resourceAttributes: rule.resourceAttributes || null,
                actionAttributes: rule.actionAttributes || null,
                environmentAttributes: rule.environmentAttributes || null,
                condition: rule.condition || null,
                priority: rule.priority || 0,
                policyId: policy.id
            });

            res.status(201).json({
                message: 'Rule added to policy successfully',
                rule: newRule
            });
        } catch (error) {
            console.error('Error adding rule to policy:', error);
            res.status(500).json({ message: 'Error adding rule to policy' });
        }
    }
};