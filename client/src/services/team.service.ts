import axios from 'axios';
import { API_URL, axiosConfig } from '../config/api';

export const teamService = {
    /**
     * Get all teams for a project
     */
    async getTeamsByProject(projectId: number) {
        try {
            const response = await axios.get(`${API_URL}/teams/project/${projectId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching teams for project ${projectId}:`, error);
            throw error;
        }
    },

    /**
     * Get a team by its ID
     */
    async getTeamById(teamId: number) {
        try {
            const response = await axios.get(`${API_URL}/teams/${teamId}`, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error fetching team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Create a new team
     */
    async createTeam(teamData: {
        name: string; projectId: number; userIds?: number[]; userRoles: Record<number, string>
    }) {
        try {
            const response = await axios.post(`${API_URL}/teams`, teamData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error('Error creating team:', error);
            throw error;
        }
    },

    /**
     * Update an existing team
     */
    async updateTeam(teamId: number, teamData: {
        name?: string; userIds?: number[]; userRoles: Record<number, string>
    }) {
        try {
            const response = await axios.put(`${API_URL}/teams/${teamId}`, teamData, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Error updating team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Update a team member's role
     */
    async updateTeamMember(teamId: number, userId: number, data: { userRole: string }) {
        try {
            const response = await axios.put(
                `${API_URL}/teams/${teamId}/member/${userId}`,
                data,
                axiosConfig
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating team member (${userId}) in team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Delete a team
     */
    async deleteTeam(teamId: number) {
        try {
            await axios.delete(`${API_URL}/teams/${teamId}`, axiosConfig);
        } catch (error) {
            console.error(`Error deleting team ${teamId}:`, error);
            throw error;
        }
    },

    /**
     * Remove a member from a team
     */
    async removeTeamMember(teamId: number, userId: number) {
        try {
            await axios.delete(`${API_URL}/teams/${teamId}/member/${userId}`, axiosConfig);
        } catch (error) {
            console.error(`Error removing user (${userId}) from team ${teamId}:`, error);
            throw error;
        }
    }
};
