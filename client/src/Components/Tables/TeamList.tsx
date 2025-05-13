import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Card,
    Flex,
    Text,
    Button,
    Tabs,
    IconButton,
    Dialog
} from '@radix-ui/themes';
import { LuPlus, LuPencil, LuTrash2 } from 'react-icons/lu';
import { teamService } from '../../services/team.service';
import TeamMembersTable from './TeamMembersTable';
import TeamModal from './TeamModal';
import { User } from '../../types';

interface TeamListProps {
    projectId: number;
    availableUsers: User[];
    projectManager?: User;
}

interface Team {
    id: number;
    name: string;
    projectId: number; 
    users: User[];
}

const TeamList = ({ projectId, availableUsers, projectManager }: TeamListProps) => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<number | null>(null);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const teamsData = await teamService.getTeamsByProject(projectId);
            setTeams(teamsData);
        } catch (err) {
            setError('Failed to load teams');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadTeams();
        }
    }, [projectId]);

    const handleCreateTeam = () => {
        setSelectedTeamId(undefined);
        setTeamModalOpen(true);
    };

    const handleEditTeam = (teamId: number) => {
        setSelectedTeamId(teamId);
        setTeamModalOpen(true);
    };

    const handleDeleteTeam = async (teamId: number) => {
        setTeamToDelete(teamId);
        setConfirmDeleteOpen(true);
    };

    const confirmDeleteTeam = async () => {
        if (teamToDelete === null) return;

        try {
            await teamService.deleteTeam(teamToDelete);
            setTeams(teams.filter(team => team.id !== teamToDelete));
            setConfirmDeleteOpen(false);
            setTeamToDelete(null);
        } catch (err) {
            setError('Failed to delete team');
            console.error(err);
        }
    };

    // Format team members for the table
    const getTeamMembers = (team: Team) => {
        return team.users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.userRole,
            tags: user.tags,
            bio: user.bio,
            isAdmin: user.isAdmin,
        }));
    };

    return (
        <Box>
            <Flex justify="between" align="center" mb="4">
                <Heading size="4">Teams</Heading>
                <Button onClick={handleCreateTeam}>
                    <LuPlus /> Add Team
                </Button>
            </Flex>

            {loading ? (
                <Text>Loading teams...</Text>
            ) : error ? (
                <Text color="red">{error}</Text>
            ) : teams.length === 0 ? (
                <Card>
                    <Text>No teams found for this project.</Text>
                </Card>
            ) : (
                <Tabs.Root defaultValue={teams[0]?.id.toString()}>
                    <Tabs.List>
                        {teams.map(team => (
                            <Tabs.Trigger key={team.id} value={team.id.toString()}>
                                {team.name}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>

                    {teams.map(team => {
                        const teamMembers = getTeamMembers(team);
                        const projectManagerMember = projectManager ? {
                            id: projectManager.id,
                            name: projectManager.name,
                            email: projectManager.email || '',
                            role: 'PROJECT MANAGER'
                        } : undefined;

                        return (
                        <Tabs.Content key={team.id} value={team.id.toString()}>
                            <Box p="4">
                                <Flex justify="between" align="center" mb="4">
                                    <Heading size="3">{team.name}</Heading>
                                    <Flex gap="2">
                                        <IconButton
                                            variant="soft"
                                            onClick={() => handleEditTeam(team.id)}
                                        >
                                            <LuPencil />
                                        </IconButton>
                                        <IconButton
                                            variant="soft"
                                            color="red"
                                            onClick={() => handleDeleteTeam(team.id)}
                                        >
                                            <LuTrash2 />
                                        </IconButton>
                                    </Flex>
                                </Flex>

                                <TeamMembersTable
                                    teamMembers={teamMembers}
                                    projectManager={projectManagerMember}
                                />
                            </Box>
                        </Tabs.Content>
                    )})}
                </Tabs.Root>
            )}

            {/* Team Create/Edit Modal */}
            <TeamModal
                open={teamModalOpen}
                onOpenChange={setTeamModalOpen}
                projectId={projectId}
                teamId={selectedTeamId}
                onTeamSaved={loadTeams}
                availableUsers={availableUsers}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <Dialog.Content>
                    <Dialog.Title>Delete Team</Dialog.Title>
                    <Dialog.Description>
                        Are you sure you want to delete this team? This action cannot be undone.
                    </Dialog.Description>
                    <Flex justify="end" gap="3" mt="4">
                        <Dialog.Close>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </Dialog.Close>
                        <Button color="red" onClick={confirmDeleteTeam}>Delete</Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </Box>
    );
};

export default TeamList;
