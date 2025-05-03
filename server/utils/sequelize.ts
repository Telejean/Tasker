import { Sequelize } from 'sequelize-typescript';
import models from '../models';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Parse the connection string
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/Taskr?schema=Taskr";

// Create a new Sequelize instance
const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    models: [...models], // Path to your models
    define: {
        schema: 'Taskr' // Set the schema explicitly
    },
    // Add any additional configuration options here
    logging: process.env.NODE_ENV !== 'production', // Only log in development
});

export default sequelize;