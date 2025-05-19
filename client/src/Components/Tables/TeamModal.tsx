import { useState, useEffect, useMemo } from 'react';
import { Dialog, Flex, Button, TextField, Text, Select, Box } from '@radix-ui/themes';
import { teamService } from '../../services/team.service';
import { User, Team, Department } from '@my-types/types';

const ROLE_OPTIONS = [
    { value: 'MEMBER', label: 'Member' },
    { value: 'LEADER', label: 'Leader' },
    { value: 'OWNER', label: 'Owner' },
];

interface SelectedUser {
    userId: number;
    role: string;
}

interface TeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    team?: Team;
    onTeamSaved: () => void;
    availableUsers: User[];
}

export const TeamModal = ({
    open,
    onOpenChange,
    projectId,
    team,
    onTeamSaved,
    availableUsers,
}: TeamModalProps) => {
    const [name, setName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');

    const isEditMode = !!team;

    const currentTeamUserIds = useMemo(
        () => isEditMode && team?.users ? team.users.map(u => u.id) : [],
        [isEditMode, team]
    );

    const departments: Department[] = useMemo(() => {
        const deptMap = new Map<number, Department>();
        availableUsers.forEach(u => {
            if (u.department && u.department.id && u.department.departmentName) {
                deptMap.set(u.department.id, u.department);
            }
        });
        return Array.from(deptMap.values());
    }, [availableUsers]);

    useEffect(() => {
        if (open) {
            if (isEditMode) {
                setDepartment('current_team');
            } else {
                setDepartment(null);
            }
        }
    }, [open, isEditMode]);

    useEffect(() => {
        if (team && open) {
            setName(team.name);
            setSelectedUsers(
                team.users
                    ? team.users.map((u: any) => ({ userId: u.id, role: u.userRole || 'MEMBER' }))
                    : []
            );
            setError('');
        } else if (open) {
            setName('');
            setSelectedUsers([]);
            setError('');
        }
    }, [team, open]);

    const filteredUsers = useMemo(() => {
        return availableUsers.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase());
            let matchesDept = true;
            if (department === 'current_team') {
                matchesDept = currentTeamUserIds.includes(user.id);
            } else if (department) {
                matchesDept = user.department?.departmentName === department;
            }
            return matchesSearch && matchesDept;
        });
    }, [availableUsers, search, department, currentTeamUserIds]);

    const handleUserToggle = (userId: number) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u.userId === userId);
            if (exists) {
                return prev.filter(u => u.userId !== userId);
            } else {
                return [...prev, { userId, role: 'MEMBER' }];
            }
        });
    };

    const handleRoleChange = (userId: number, role: string) => {
        setSelectedUsers(prev =>
            prev.map(u => (u.userId === userId ? { ...u, role } : u))
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Team name is required');
            return;
        }
        try {
            setIsLoading(true);
            setError('');
            const userIds = selectedUsers.map(u => u.userId);
            const userRoles: Record<number, string> = Object.fromEntries(selectedUsers.map(u => [u.userId, u.role]));
            if (isEditMode) {
                await teamService.updateTeam(team?.id, {
                    name,
                    userIds,
                    userRoles
                });
            } else {
                await teamService.createTeam({
                    name,
                    projectId,
                    userIds,
                    userRoles
                });
            }
            onTeamSaved();
            onOpenChange(false);
        } catch (err) {
            setError('Failed to save team');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content style={{ maxWidth: 600 }}>
                <Dialog.Title>{isEditMode ? 'Edit Team' : 'Create Team'}</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    {isEditMode
                        ? 'Update team information and members'
                        : 'Create a new team for this project'}
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Team Name
                        </Text>
                        <TextField.Root
                            placeholder="Enter team name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    {/* Search and Department Filter */}
                    <Flex gap="2" align="center">
                        <TextField.Root
                            placeholder="Search users..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: 2 }}
                        />
                        <Select.Root value={department} onValueChange={setDepartment}>
                            <Select.Trigger placeholder="Department" style={{ minWidth: 120 }} />
                            <Select.Content>
                                {isEditMode && (
                                    <Select.Item value="current_team">Current Team Members</Select.Item>
                                )}
                                <Select.Item value={null}>All</Select.Item>
                                {departments.map(dept => (
                                    <Select.Item key={dept.id} value={dept.departmentName}>
                                        {dept.departmentName}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Team Members
                        </Text>
                        <Flex direction="column" gap="1">
                            {filteredUsers.map(user => {
                                const selected = selectedUsers.find(u => u.userId === user.id);
                                return (
                                    <Flex key={user.id} align="center" gap="2" justify={'between'}>
                                        <Flex>
                                            <input
                                                type="checkbox"
                                                id={`user-${user.id}`}
                                                checked={!!selected}
                                                onChange={() => handleUserToggle(user.id)}
                                            />
                                            <label htmlFor={`user-${user.id}`}>
                                                <Box>
                                                    <Text size="3">{user.id}.{user.name} {user.surname + " "} </Text>
                                                    <Text size="2">({user.email})</Text>
                                                </Box>
                                            </label>
                                        </Flex>
                                        {/* <label htmlFor={`user-${user.id}`}>{user.name} ({user.email})</label> */}
                                        {selected && (
                                            <Select.Root
                                                value={selected.role}
                                                onValueChange={role => handleRoleChange(user.id, role)}
                                            >
                                                <Select.Trigger style={{ minWidth: 100 }} />
                                                <Select.Content>
                                                    {ROLE_OPTIONS.map(opt => (
                                                        <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Root>
                                        )}
                                    </Flex>
                                );
                            })}
                        </Flex>
                    </Box>

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
                        {isLoading ? 'Saving...' : isEditMode ? 'Update Team' : 'Create Team'}
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default TeamModal;
