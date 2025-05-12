import { useState, useEffect } from 'react';
import { Dialog, Flex, Button, TextField, Text, Select, Box } from '@radix-ui/themes';
import { teamService } from '../../services/team.service';
import { User } from '../../types';

interface TeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: number;
    teamId?: number;
    onTeamSaved: () => void;
    availableUsers: User[];
}

export const TeamModal = ({
    open,
    onOpenChange,
    projectId,
    teamId,
    onTeamSaved,
    availableUsers
}: TeamModalProps) => {
    const [name, setName] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!teamId;

    useEffect(() => {
        // If editing existing team, load team data
        if (teamId && open) {
            const loadTeam = async () => {
                try {
                    setIsLoading(true);
                    const team = await teamService.getTeamById(teamId);
                    setName(team.name);

                    // Extract user IDs from the userTeams array
                    const userIds = team.userTeams?.map(ut => ut.userId) || [];
                    setSelectedUserIds(userIds);
                } catch (err) {
                    setError('Failed to load team data');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            loadTeam();
        } else {
            // Reset form for new team
            setName('');
            setSelectedUserIds([]);
            setError('');
        }
    }, [teamId, open]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Team name is required');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            if (isEditMode) {
                await teamService.updateTeam(teamId, {
                    name,
                    userIds: selectedUserIds
                });
            } else {
                await teamService.createTeam({
                    name,
                    projectId,
                    userIds: selectedUserIds
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

    const handleUserToggle = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content style={{ maxWidth: 450 }}>
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
                        <TextField.Input
                            placeholder="Enter team name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <Box>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Team Members
                        </Text>
                        <Flex direction="column" gap="1">
                            {availableUsers.map(user => (
                                <Flex key={user.id} align="center" gap="2">
                                    <input
                                        type="checkbox"
                                        id={`user-${user.id}`}
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id)}
                                    />
                                    <label htmlFor={`user-${user.id}`}>
                                        {user.name} ({user.email})
                                    </label>
                                </Flex>
                            ))}
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
