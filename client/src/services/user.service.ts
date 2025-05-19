import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';
import { User } from '@my-types/types';

export const userService = {
    /**
     * Get all users
     */
    async getAllUsers(): Promise<User[]> {
        try {
            const response = await axios.get(`${API_URL}/users`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    async getUsersFromProject(projectId: number): Promise<User[]> {
        try {
            const response = await axios.get(`${API_URL}/users/project/${projectId}`)
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    /**
     * Get a user by ID
     */
    async getUserById(userId: number): Promise<User> {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            throw error;
        }
    }
};
