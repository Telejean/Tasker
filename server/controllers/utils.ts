import { Request, Response } from 'express';
import { Sequelize } from 'sequelize';
import db from '../../models'; // Adjust the path to your Sequelize models

export const syncDatabase = async (req: Request, res: Response): Promise<void> => {
    try {
        await db.sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
        res.status(200).json({ message: 'Database synchronized successfully.' });
    } catch (error) {
        console.error('Error synchronizing database:', error);
        res.status(500).json({ message: 'Failed to synchronize database.', error: error.message });
    }
};