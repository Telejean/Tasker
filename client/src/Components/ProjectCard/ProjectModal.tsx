import { useState, useEffect, useCallback } from 'react';
import { Dialog, Flex, Button, Text, Box, TextField } from '@radix-ui/themes';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/user.service';
import { User } from '@my-types/types';
import * as LuIcons from 'react-icons/lu'
import React from 'react';
import Permission from '../Permission/Permission';

interface ProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: number;
    onProjectSaved: () => void;
}

const ProjectModal = ({ open, onOpenChange, projectId, onProjectSaved } : ProjectModalProps) => {
    const [name, setName] = useState('');
    const [manager, setManager] = useState<number | null>(null);
    const [userIds, setUserIds] = useState<number[]>([]);
    const [iconId, setIconId] = useState(1);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [originalFormState, setOriginalFormState] = useState({
        name: '',
        manager: null as number | null,
        userIds: [] as number[],
        iconId: 1,
        startDate: '',
        endDate: ''
    });
    const [managerSearch, setManagerSearch] = useState('');
    const [showManagerDropdown, setShowManagerDropdown] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const isEditMode = !!projectId;

    const hasUnsavedChanges = useCallback(() => {
        return name !== originalFormState.name ||
            manager !== originalFormState.manager ||
            iconId !== originalFormState.iconId ||
            JSON.stringify(userIds.sort()) !== JSON.stringify(originalFormState.userIds.sort()) ||
            startDate !== originalFormState.startDate ||
            endDate !== originalFormState.endDate;
    }, [name, manager, userIds, iconId, originalFormState, startDate, endDate]);

    const handleCloseRequest = useCallback(() => {
        if (hasUnsavedChanges()) {
            setShowConfirmDialog(true);
        } else {
            onOpenChange(false);
        }
    }, [hasUnsavedChanges, onOpenChange]);

    const handleConfirmDiscard = () => {
        setShowConfirmDialog(false);
        onOpenChange(false);
    };

    const validateDates = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start >= end) {
                setError('End date must be after start date');
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await userService.getAllUsers();
                setAvailableUsers(users);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load available users');
            }
        };

        if (open) {
            fetchUsers();
        }
    }, [open]);

    useEffect(() => {
        if (projectId && open) {
            const loadProject = async () => {
                try {
                    setIsLoading(true);
                    const project = await projectService.getProjectById(projectId);
                    setName(project.name);
                    setManager(project.managerId);
                    setIconId(project.iconId || 1);
                    setStartDate(project.startDate ? project.startDate.slice(0, 10) : '');
                    setEndDate(project.endDate ? project.endDate.slice(0, 10) : '');

                    const managerUser = availableUsers.find(u => u.id === project.managerId);
                    if (managerUser) {
                        setManagerSearch(`${managerUser.name} ${managerUser.surname || ''}`);
                    }

                    const allUserIds: number[] = [];
                    if (project.teams && Array.isArray(project.teams)) {
                        project.teams.forEach((team: any) => {
                            if (team.userTeams && Array.isArray(team.userTeams)) {
                                team.userTeams.forEach((userTeam: any) => {
                                    if (userTeam.userId) {
                                        allUserIds.push(userTeam.userId);
                                    }
                                });
                            }
                        });
                    }

                    setUserIds([...new Set(allUserIds)]);
                    setOriginalFormState({
                        name: project.name,
                        manager: project.managerId,
                        userIds: [...new Set(allUserIds)],
                        iconId: project.iconId || 1,
                        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
                        endDate: project.endDate ? project.endDate.slice(0, 10) : ''
                    });
                } catch (err) {
                    setError('Failed to load project data');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            loadProject();
        } else {
            setName('');
            setManager(null);
            setUserIds([]);
            setIconId(1);
            setStartDate('');
            setEndDate('');
            setManagerSearch('');
            setError('');
            setOriginalFormState({
                name: '',
                manager: null,
                userIds: [],
                iconId: 1,
                startDate: '',
                endDate: ''
            });
        }
    }, [projectId, open, availableUsers]);

    const handleSave = async () => {
        setError('');

        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        if (!manager) {
            setError('Project manager is required');
            return;
        }

        if (!startDate) {
            setError('Project start date is required');
            return;
        }

        if (!endDate) {
            setError('Project end date is required');
            return;
        }

        if (!validateDates()) {
            return;
        }

        try {
            setIsLoading(true);

            const projectData = {
                name: name.trim(),
                managerId: manager,
                userIds,
                iconId,
                icon: `icon-${iconId}`,
                status: 'ACTIVE',
                startDate,
                endDate
            };

            if (isEditMode && projectId) {
                await projectService.updateProject(projectId, projectData);
            } else {
                await projectService.createProject(projectData);
            }

            onProjectSaved();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error saving project:', err);
            const errorMessage = err?.response?.data?.error || 'Failed to save project';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserToggle = (userId: number) => {
        setUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = availableUsers.filter(user =>
        (user.name + ' ' + (user.surname || '') + ' ' + (user.email || ''))
            .toLowerCase()
            .includes(managerSearch.toLowerCase())
    );

    const modalContent = (
        <Dialog.Root open={open} onOpenChange={handleCloseRequest}>
            <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>{isEditMode ? 'Edit Project' : 'Create Project'}</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {isEditMode
                        ? 'Update project information and members'
                        : 'Create a new project and assign team members'}
                </Dialog.Description>
                
                <Flex direction="column" gap="4">
                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project Name
                        </Text>
                        <TextField.Root
                            placeholder="Enter project name"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            style={{ borderColor: !name.trim() && error ? 'var(--color-error)' : undefined }}
                        />
                    </Box>

                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project Manager
                        </Text>
                        <Box style={{ position: 'relative' }}>
                            <TextField.Root
                                placeholder="Search manager..."
                                value={managerSearch}
                                onChange={e => setManagerSearch(e.target.value)}
                                onFocus={() => setShowManagerDropdown(true)}
                                onBlur={() => setTimeout(() => setShowManagerDropdown(false), 150)}
                                style={{ borderColor: !manager && error ? 'var(--color-error)' : undefined }}
                            />
                            {showManagerDropdown && (
                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        border: '1px solid var(--gray-6)',
                                        borderRadius: 4,
                                        zIndex: 10,
                                        maxHeight: 180,
                                        overflowY: 'auto',
                                    }}
                                >
                                    {filteredUsers.map(user => (
                                        <Box
                                            key={user.id}
                                            style={{
                                                padding: '8px',
                                                cursor: 'pointer',
                                                background: manager === user.id ? 'var(--accent-3)' : 'transparent',
                                            }}
                                            onMouseDown={() => {
                                                setManager(user.id);
                                                setManagerSearch(`${user.name} ${user.surname || ''}`);
                                                setShowManagerDropdown(false);
                                            }}
                                        >
                                            {user.name} {user.surname || ''} ({user.email || ''})
                                        </Box>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <Text size="2" color="gray" style={{ padding: '8px' }}>
                                            No users found
                                        </Text>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>

                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project Icon
                        </Text>
                        <Flex gap="2" wrap="wrap">
                            {Object.entries(LuIcons)
                                .slice(0, 50)
                                .map(([key, Icon], idx) => (
                                    <Box
                                        key={key}
                                        onClick={() => setIconId(idx + 1)}
                                        style={{
                                            cursor: 'pointer',
                                            border: iconId === idx + 1 ? '2px solid var(--accent-9)' : '2px solid transparent',
                                            borderRadius: '4px',
                                            padding: '8px',
                                            backgroundColor: iconId === idx + 1 ? 'var(--accent-3)' : 'transparent'
                                        }}
                                    >
                                        <Icon size={24} />
                                    </Box>
                                ))}
                        </Flex>
                    </Box>

                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Team Members
                        </Text>
                        <Box
                            style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid var(--gray-6)',
                                borderRadius: '4px',
                                padding: '8px',
                            }}
                        >
                            {availableUsers.length > 0 ? (
                                <Flex direction="column" gap="1">
                                    {availableUsers.map(user => (
                                        <Flex key={user.id} align="center" gap="2">
                                            <input
                                                type="checkbox"
                                                id={`user-${user.id}`}
                                                checked={userIds.includes(user.id)}
                                                onChange={() => handleUserToggle(user.id)}
                                            />
                                            <label htmlFor={`user-${user.id}`} style={{ cursor: 'pointer' }}>
                                                {user.name} {user.surname || ''} ({user.email || ''})
                                            </label>
                                        </Flex>
                                    ))}
                                </Flex>
                            ) : (
                                <Text size="2" color="gray">
                                    Loading available users...
                                </Text>
                            )}
                        </Box>
                    </Box>

                    <Flex gap="3">
                        <Box style={{ flex: 1 }}>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Start Date
                            </Text>
                            <TextField.Root
                                type="date"
                                value={startDate}
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    setError(''); 
                                }}
                                style={{ borderColor: !startDate && error ? 'var(--color-error)' : undefined }}
                            />
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <Text as="div" size="2" mb="1" weight="bold">
                                End Date
                            </Text>
                            <TextField.Root
                                type="date"
                                value={endDate}
                                onChange={e => {
                                    setEndDate(e.target.value);
                                    setError(''); 
                                }}
                                style={{ borderColor: !endDate && error ? 'var(--color-error)' : undefined }}
                            />
                        </Box>

                        
                    </Flex>

                    {error && (
                        <Text color="red" size="2">
                            {error}
                        </Text>
                    )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
                    </Button>
                </Flex>
            </Dialog.Content>

            {showConfirmDialog && (
                <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <Dialog.Content style={{ maxWidth: 400 }}>
                        <Dialog.Title>Unsaved Changes</Dialog.Title>
                        <Dialog.Description size="2" mb="4">
                            You have unsaved changes. Are you sure you want to discard them?
                        </Dialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                            <Button variant="soft" color="gray" onClick={() => setShowConfirmDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="soft" color="red" onClick={handleConfirmDiscard}>
                                Discard Changes
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            )}
        </Dialog.Root>
    );

    if (isEditMode) {
        return (
            <Permission 
                action="update" 
                resourceType="project" 
                resourceId={projectId}
                fallback={null}
            >
                {modalContent}
            </Permission>
        );
    }

    return (
        <Permission 
            action="create" 
            resourceType="project"
            fallback={null}
        >
            {modalContent}
        </Permission>
    );
};

export default ProjectModal;