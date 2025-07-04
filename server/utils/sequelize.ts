import { Sequelize } from 'sequelize-typescript';
import models from '../models';
import dotenv from 'dotenv';

dotenv.config();


const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/Taskr?schema=Taskr";

const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    models: [...models],
    define: {
        schema: 'Taskr'
    },

});

export default sequelize;