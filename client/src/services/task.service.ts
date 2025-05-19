import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';
import { Task } from '@my-types/types';
import { DateValue, parseDate } from '@internationalized/date';

export const taskService = {
   dateValueToString(date: DateValue): Date {
        const month = date.month;
        const day = date.day;
        const year = date.year;
        return new Date(`${year}/${month}/${day}`);
    },
    /**
     * Get all tasks assigned to the current user
     */
    async getMyTasks() :Promise<Task[]> {
        try {
            const response = await axios.get(`${API_URL}/tasks/my-tasks`, axiosConfig);
            const tasks = response.data.map((task: Task) => {
                return {...task, deadline: new Date(task.deadline)};
            });
            return tasks;
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
              const tasks = response.data.map((task: Task) => {
                return {...task, deadline: new Date(task.deadline)};
            });
            return tasks;
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
    async createTask(taskData: Task) {
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
