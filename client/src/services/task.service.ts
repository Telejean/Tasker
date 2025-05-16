import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';
import { Task } from '@/types';
import { parseDate } from '@internationalized/date';

export const taskService = {
    formatTask(tasksData: Task[]){
        return tasksData.map((task: any) => ({
                  id: task.id,
                  projectName: task.project?.name || "No Project",
                  name: task.name,
                  deadline: task.deadline ? parseDate(new Date(task.deadline).toISOString().split('T')[0]) : null,
                  description: task.description || "",
                  status: task.status || "Not Started",
                  assignedPeople: task.assignedUsers.map((person: any) => person.name +" " + person.surname || "Unknown") || [],
                  priority: task.priority || "medium"
                }));
    },
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
