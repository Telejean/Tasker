import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';
import { useAtom } from 'jotai';
import { userAtom } from '@/App';

interface PermissionProps {
    action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'assign';
    resourceType: string;
    resourceId?: number;
    resourceAttributes?: Record<string, any>; // Add resource attributes for ABAC
    children: ReactNode;
    fallback?: ReactNode;
    showLoading?: boolean; // Option to show loading state
    loadingComponent?: ReactNode; // Custom loading component
}

/**
 * Permission component for conditional rendering based on user permissions
 * 
 * @example
 * // Only show the Edit button if user has 'update' permission for this project
 * <Permission action="update" resourceType="project" resourceId={project.id}>
 *   <Button>Edit Project</Button>
 * </Permission>
 * 
 * @example
 * // With resource attributes for more complex ABAC evaluation
 * <Permission 
 *   action="update" 
 *   resourceType="project" 
 *   resourceId={project.id}
 *   resourceAttributes={{ departmentId: project.departmentId, managerId: project.managerId }}
 * >
 *   <Button>Edit Project</Button>
 * </Permission>
 */
const Permission = ({
    action,
    resourceType,
    resourceId,
    resourceAttributes,
    children,
    fallback = null,
    showLoading = false,
    loadingComponent = <div className="text-gray-500">Loading...</div>
}: PermissionProps) => {
    const [user] = useAtom(userAtom);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkPermission = async () => {
            if (!user) {
                setHasPermission(false);
                setLoading(false);
                return;
            }

            try {
                setError(null);

                if (user.isAdmin) {
                    setHasPermission(true);
                    setLoading(false);
                    return;
                }

                const params: any = {
                    action,
                    resourceType,
                    ...(resourceId && { resourceId }),
                    ...(resourceAttributes && { resourceAttributes: JSON.stringify(resourceAttributes) })
                };

                const { data } = await axios.get(
                    `${API_URL}/auth/check-permission`,
                    { ...axiosConfig, params }
                );

                setHasPermission(data.hasPermission);

            } catch (error: any) {
                console.error('Error checking permission:', error);
                setError(error.response?.data?.message || 'Permission check failed');
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [user, action, resourceType, resourceId, resourceAttributes]);

    if (loading && showLoading) {
        return <>{loadingComponent}</>;
    }

    if (loading) {
        return null;
    }

    if (error) {
        console.warn(`Permission check error: ${error}`);
    }

    return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default Permission;

export const usePermission = (
    action: string,
    resourceType: string,
    resourceId?: number,
    resourceAttributes?: Record<string, any>
) => {
    const [user] = useAtom(userAtom);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPermission = async () => {
            if (!user) {
                setHasPermission(false);
                setLoading(false);
                return;
            }

            if (user.isAdmin) {
                setHasPermission(true);
                setLoading(false);
                return;
            }

            try {
                const params: any = {
                    action,
                    resourceType,
                    ...(resourceId && { resourceId }),
                    ...(resourceAttributes && { resourceAttributes: JSON.stringify(resourceAttributes) })
                };

                const { data } = await axios.get(
                    `${API_URL}/auth/check-permission`,
                    { ...axiosConfig, params }
                );

                setHasPermission(data.hasPermission);
            } catch (error) {
                console.error('Error checking permission:', error);
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [user, action, resourceType, resourceId, resourceAttributes]);

    return { hasPermission, loading };
};