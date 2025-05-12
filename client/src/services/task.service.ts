import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';

export const taskService = {
    /**
     * Get all tasks assigned to the current user
     */
    async getMyTasks() {
        try {
            const response = await axios.get(`${API_URL}/tasks/my-tasks`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error fetching my tasks:', error);
            throw error;
        }
    },

    /**
     * Get all tasks for a specific project
     */
    async getTasksByProject(projectId: number) {
        try {
            const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching tasks for project ${projectId}:`, error);
            throw error;
        }
    },

    /**
     * Get a task by its ID
     */
    async getTaskById(taskId: number) {
        try {
            const response = await axios.get(`${API_URL}/tasks/${taskId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new task
     */
    async createTask(taskData: any) {
        try {
            const response = await axios.post(`${API_URL}/tasks`, taskData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    /**
     * Update an existing task
     */
    async updateTask(taskId: number, taskData: any) {
        try {
            const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId: number) {
        try {
            await axios.delete(`${API_URL}/tasks/${taskId}`, axiosConfig);
            return true;
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            throw error;
        }
    }
};
