import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';

export interface PermissionRequest {
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    resourceType: string;
    resourceId?: number;
}

/**
 * Client-side authorization service for checking permissions
 */
export const AuthorizationService = {
    /**
     * Check if the current user has permission to perform an action on a resource
     */
    async hasPermission({ action, resourceType, resourceId }: PermissionRequest): Promise<boolean> {
        try {
            const params = {
                action,
                resourceType,
                ...(resourceId && { resourceId })
            };

            const { data } = await axios.get(
                `${API_URL}/auth/check-permission`,
                { ...axiosConfig, params }
            );

            return data.hasPermission;
        } catch (error) {
            console.error('Error checking permission:', error);
            // Default to no permission on error
            return false;
        }
    },

    /**
     * Check multiple permissions at once and return results as an object
     * 
     * @example
     * const permissions = await AuthorizationService.batchCheckPermissions([
     *   { action: 'update', resourceType: 'project', resourceId: 1 },
     *   { action: 'delete', resourceType: 'project', resourceId: 1 }
     * ]);
     * // Returns: { 'update:project:1': true, 'delete:project:1': false }
     */
    async batchCheckPermissions(requests: PermissionRequest[]): Promise<Record<string, boolean>> {
        try {
            const { data } = await axios.post(
                `${API_URL}/auth/check-permissions-batch`,
                { permissions: requests },
                axiosConfig
            );

            return data.results;
        } catch (error) {
            console.error('Error batch checking permissions:', error);

            return requests.reduce((acc, { action, resourceType, resourceId }) => {
                const key = `${action}:${resourceType}${resourceId ? `:${resourceId}` : ''}`;
                acc[key] = false;
                return acc;
            }, {} as Record<string, boolean>);
        }
    },

    /**
     * Get all policies assigned to a resource
     */
    async getResourcePolicies(resourceType: string, resourceId: number) {
        try {
            const { data } = await axios.get(
                `${API_URL}/policies/assignments/${resourceType}/${resourceId}`,
                axiosConfig
            );

            return data;
        } catch (error) {
            console.error(`Error fetching ${resourceType} policies:`, error);
            return [];
        }
    },

    /**
     * Get all policies
     */
    async getAllPolicies(activeOnly = true) {
        try {
            const { data } = await axios.get(
                `${API_URL}/policies${activeOnly ? '?active=true' : ''}`,
                axiosConfig
            );

            return data;
        } catch (error) {
            console.error('Error fetching policies:', error);
            return [];
        }
    },

    /**
     * Assign a policy to a resource
     */
    async assignPolicy(resourceType: string, resourceId: number, policyId: number, expiresAt?: string) {
        try {
            const payload = {
                policyId,
                [`${resourceType}Id`]: resourceId,
                expiresAt: expiresAt || null
            };

            const { data } = await axios.post(
                `${API_URL}/policies/assign/${resourceType}`,
                payload,
                axiosConfig
            );

            return data;
        } catch (error) {
            console.error(`Error assigning policy to ${resourceType}:`, error);
            throw error;
        }
    },

    /**
     * Remove a policy assignment
     */
    async removePolicyAssignment(resourceType: string, assignmentId: number) {
        try {
            await axios.delete(
                `${API_URL}/policies/assignments/${resourceType}/${assignmentId}`,
                axiosConfig
            );

            return true;
        } catch (error) {
            console.error(`Error removing policy assignment from ${resourceType}:`, error);
            throw error;
        }
    },

    async handleSignOut() {
        await axios.post(`${API_URL}/auth/logout`, {}, axiosConfig);
        window.location.reload();
    }
};

export default AuthorizationService;