import { error } from 'console';
import { User as UserModel } from '../models/User.model';
import sequelize from '../utils/sequelize';
import {User} from "@my-types/types"


export const validateUserDataService = async (userData: any): Promise<void> => {
    try {
        if (!userData.name) {
            throw new Error("Field 'name' is missing")
        }

        if (!userData.surname) {
            throw new Error("Field 'surname' is missing")
        }

        if (!userData.email) {
            throw new Error("Field 'email' is missing")
        }

        if (!userData.phoneNumber) {
            throw new Error("Field 'phoneNumber' is missing")
        }

        if (!userData.bio) {
            userData.bio = '';
        }

        if (!userData.tags) {
            userData.tags = JSON.parse("{}");
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }

        const existingUser = await UserModel.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            console.log(error)

            throw new Error('User with this email already exists');
        }
    } catch (error) {
        console.log(error)
        if (error instanceof Error) {
            throw new Error(`Failed to validate user: ${error.message}`);
        }
        throw new Error('Failed to validate user');
    }
}

export const createUserService = async (userData: any) => {
    try {
        const newUser = await UserModel.create({ ...userData });
        return newUser.toJSON() as User;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create user: ${error}`);
        }
        throw new Error('Failed to create user');
    }
}


export const createBulkUsersService = async (users: any[]) => {
    const transaction = await sequelize.transaction();

    try {
        for (const userData of users) {
            await validateUserDataService(userData);
        }

        const usersToCreate = users.map(user => ({
            name: user.name,
            surname: user.surname,
            email: user.email,
            tags: user.tags,
            bio: user.bio,
            departmentId: user.departmentId
        }));

        const createdUsers = await UserModel.bulkCreate(usersToCreate, {
            transaction,
            returning: true
        });

        await transaction.commit();
        return createdUsers.map(user => user.toJSON() as User);
    } catch (error) {
        await transaction.rollback();
        if (error instanceof Error) {
            throw new Error(`Failed to create users: ${error.message}`);
        }
        throw new Error('Failed to create users');
    }
}