import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';
import { useAtom } from 'jotai';
import { userAtom } from '@/App';

interface PermissionProps {
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    resourceType: string;
    resourceId?: number;
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Permission component for conditional rendering based on user permissions
 * 
 * @example
 * // Only show the Edit button if user has 'update' permission for this project
 * <Permission action="update" resourceType="project" resourceId={project.id}>
 *   <Button>Edit Project</Button>
 * </Permission>
 */
const Permission = ({
    action,
    resourceType,
    resourceId,
    children,
    fallback = null
}: PermissionProps) => {
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

            try {
                if (user.isAdmin) {
                    setHasPermission(true);
                    setLoading(false);
                    return;
                }

                const params = {
                    action,
                    resourceType,
                    ...(resourceId && { resourceId })
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
    }, [action, resourceType, resourceId, user]);

    // Show nothing while loading
    if (loading) {
        return null;
    }

    // Show children if permission granted, otherwise show fallback
    return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default Permission;