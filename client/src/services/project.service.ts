import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';

export const projectService = {
    /**
     * Get all projects where the current user is a member
     */
    async getMyProjects() {
        try {
            const response = await axios.get(`${API_URL}/projects/my-projects`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error fetching my projects:', error);
            throw error;
        }
    },

    /**
     * Get a project by its ID
     */
    async getProjectById(projectId: number) {
        try {
            const response = await axios.get(`${API_URL}/projects/${projectId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching project ${projectId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new project
     */
    async createProject(projectData: any) {
        try {
            const response = await axios.post(`${API_URL}/projects`, projectData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    /**
     * Update an existing project
     */
    async updateProject(projectId: number, projectData: any) {
        try {
            const response = await axios.put(`${API_URL}/projects/${projectId}`, projectData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error updating project ${projectId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a project
     */
    async deleteProject(projectId: number) {
        try {
            await axios.delete(`${API_URL}/projects/${projectId}`, axiosConfig);
            return true;
        } catch (error) {
            console.error(`Error deleting project ${projectId}:`, error);
            throw error;
        }
    }
};
