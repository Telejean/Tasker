import { Request, Response } from 'express';
import { Sequelize } from 'sequelize';
import sq from '../utils/sequelize';

export const utilsController = {
    syncDatabase : async (req: Request, res: Response): Promise<void> => {
        try {
            await sq.sync({ force: true }); 
            res.status(200).json({ message: 'Database synchronized successfully.' });
        } catch (error : any) {
            console.error('Error synchronizing database:', error);
            res.status(500).json({ message: 'Failed to synchronize database.', error: error.message });
        }
    }
}