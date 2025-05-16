import type { Request, Response } from 'express';
import { Department, User } from '../models';

export const departmentController = {
    async getAllDepartments(req: Request, res: Response) {
        try {
            const departments = await Department.findAll({
                include: [{ model: User, attributes: ['id', 'name', 'email'] }]
            });
            return res.status(200).json(departments);
        } catch (error) {
            console.error('Error getting departments:', error);
            return res.status(500).json({ error: 'Failed to retrieve departments' });
        }
    },

    async getDepartmentById(req: Request, res: Response) {
        try {
            const departmentId = parseInt(req.params.id);
            const department = await Department.findByPk(departmentId, {
                include: [{ model: User, attributes: ['id', 'name', 'email'] }]
            });
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
            }
            return res.status(200).json(department);
        } catch (error) {
            console.error('Error getting department:', error);
            return res.status(500).json({ error: 'Failed to retrieve department' });
        }
    },

    async createDepartment(req: Request, res: Response) {
        try {
            const { departmentName } = req.body;
            if (!departmentName) {
                return res.status(400).json({ error: 'Department name is required' });
            }
            const department = await Department.create({ departmentName });
            return res.status(201).json(department);
        } catch (error) {
            console.error('Error creating department:', error);
            return res.status(500).json({ error: 'Failed to create department' });
        }
    },

    async updateDepartment(req: Request, res: Response) {
        try {
            const departmentId = parseInt(req.params.id);
            const { departmentName } = req.body;
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
            }
            if (departmentName !== undefined) department.departmentName = departmentName;
            await department.save();
            return res.status(200).json(department);
        } catch (error) {
            console.error('Error updating department:', error);
            return res.status(500).json({ error: 'Failed to update department' });
        }
    },

    async deleteDepartment(req: Request, res: Response) {
        try {
            const departmentId = parseInt(req.params.id);
            const department = await Department.findByPk(departmentId);
            if (!department) {
                return res.status(404).json({ error: 'Department not found' });
            }
            await department.destroy();
            return res.status(204).send();
        } catch (error) {
            console.error('Error deleting department:', error);
            return res.status(500).json({ error: 'Failed to delete department' });
        }
    },

    async bulkCreateDepartments(req: Request, res: Response) {
        try {
            let { departments } = req.body;
            if (!Array.isArray(departments) || departments.length === 0) {
                return res.status(400).json({ error: 'Departments array is required' });
            }
            departments = departments
                .filter((d: any) => typeof d === 'string' && d.trim().length > 0)
                .map((name: string) => ({ departmentName: name.trim() }));
            if (departments.length === 0) {
                return res.status(400).json({ error: 'No valid department names found' });
            }
            const created = await Department.bulkCreate(departments, { returning: true });
            return res.status(201).json(created);
        } catch (error) {
            console.error('Error bulk creating departments:', error);
            return res.status(500).json({ error: 'Failed to bulk create departments' });
        }
    }
};
