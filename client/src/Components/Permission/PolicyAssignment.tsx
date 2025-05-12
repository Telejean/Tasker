import { useState, useEffect } from 'react';
import { Box, Card, Flex, Heading, Button, Select, Text, Table } from '@radix-ui/themes';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';
import { LuPlus, LuTrash } from 'react-icons/lu';

interface PolicyAssignmentProps {
    resourceType: 'user' | 'project' | 'task';
    resourceId: number;
    resourceName: string;
}

interface AssignmentData {
    id: number;
    policyId: number;
    policy: {
        id: number;
        name: string;
    };
    assignedAt: string;
    expiresAt?: string;
}

const PolicyAssignment = ({ resourceType, resourceId, resourceName }: PolicyAssignmentProps) => {
    const [policies, setPolicies] = useState([]);
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
    const [expiresAt, setExpiresAt] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load available policies and current assignments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all active policies
                const policiesRes = await axios.get(`${API_URL}/policies?active=true`, axiosConfig);
                setPolicies(policiesRes.data);

                // Fetch current assignments for this resource
                const assignmentsRes = await axios.get(
                    `${API_URL}/policies/assignments/${resourceType}/${resourceId}`,
                    axiosConfig
                );
                setAssignments(assignmentsRes.data);
            } catch (err) {
                console.error('Error fetching policy data:', err);
                setError('Failed to load policy data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [resourceType, resourceId]);

    // Handle assigning a policy to the resource
    const handleAssignPolicy = async () => {
        if (!selectedPolicyId) {
            setError('Please select a policy to assign');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const payload = {
                policyId: parseInt(selectedPolicyId),
                [`${resourceType}Id`]: resourceId,
                expiresAt: expiresAt || null
            };

            const { data } = await axios.post(
                `${API_URL}/policies/assign/${resourceType}`,
                payload,
                axiosConfig
            );

            // Update assignments list
            setAssignments(prev => [...prev, data]);

            // Reset form
            setSelectedPolicyId('');
            setExpiresAt('');
        } catch (err) {
            console.error('Error assigning policy:', err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Failed to assign policy');
            } else {
                setError('Failed to assign policy');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle removing a policy assignment
    const handleRemoveAssignment = async (assignmentId: number) => {
        if (!window.confirm('Are you sure you want to remove this policy assignment?')) {
            return;
        }

        try {
            setLoading(true);

            await axios.delete(
                `${API_URL}/policies/assignments/${resourceType}/${assignmentId}`,
                axiosConfig
            );

            // Update assignments list
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        } catch (err) {
            console.error('Error removing policy assignment:', err);
            setError('Failed to remove policy assignment');
        } finally {
            setLoading(false);
        }
    };

    // Filter out policies that are already assigned
    const availablePolicies = policies.filter(
        policy => !assignments.some(a => a.policyId === policy.id)
    );

    return (
        <Card size="2">
            <Flex direction="column" gap="4">
                <Heading as="h3" size="4">
                    Policy Assignments for {resourceType}: {resourceName}
                </Heading>

                {error && (
                    <Text color="red" size="2">{error}</Text>
                )}

                {/* Current Assignments */}
                <Box>
                    <Heading as="h4" size="3" mb="2">Current Assignments</Heading>

                    {assignments.length === 0 ? (
                        <Text color="gray">No policies assigned yet.</Text>
                    ) : (
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Policy</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Assigned Date</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Expires</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {assignments.map(assignment => (
                                    <Table.Row key={assignment.id}>
                                        <Table.Cell>{assignment.policy.name}</Table.Cell>
                                        <Table.Cell>
                                            {new Date(assignment.assignedAt).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {assignment.expiresAt
                                                ? new Date(assignment.expiresAt).toLocaleDateString()
                                                : 'Never'}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button
                                                variant="soft"
                                                color="red"
                                                size="1"
                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                            >
                                                <LuTrash />
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </Box>

                {/* Assign New Policy */}
                <Box>
                    <Heading as="h4" size="3" mb="2">Assign Policy</Heading>

                    {availablePolicies.length === 0 ? (
                        <Text color="gray">No available policies to assign.</Text>
                    ) : (
                        <Flex direction="column" gap="2">
                            <Flex gap="3" align="end">
                                <Box style={{ flex: 2 }}>
                                    <Text as="div" size="2" weight="bold" mb="1">Select Policy</Text>
                                    <Select.Root value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                                        <Select.Trigger placeholder="Choose a policy..." />
                                        <Select.Content>
                                            <Select.Group>
                                                {availablePolicies.map(policy => (
                                                    <Select.Item key={policy.id} value={policy.id.toString()}>
                                                        {policy.name}
                                                    </Select.Item>
                                                ))}
                                            </Select.Group>
                                        </Select.Content>
                                    </Select.Root>
                                </Box>

                                <Box style={{ flex: 1 }}>
                                    <Text as="div" size="2" weight="bold" mb="1">Expires (Optional)</Text>
                                    <input
                                        type="date"
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--gray-6)'
                                        }}
                                    />
                                </Box>

                                <Button onClick={handleAssignPolicy} disabled={loading}>
                                    <LuPlus /> Assign
                                </Button>
                            </Flex>

                            {resourceType === 'user' && (
                                <Text size="1" color="gray">
                                    Note: User policies apply to all actions performed by this user.
                                </Text>
                            )}

                            {resourceType === 'project' && (
                                <Text size="1" color="gray">
                                    Note: Project policies apply to all tasks within this project as well.
                                </Text>
                            )}
                        </Flex>
                    )}
                </Box>
            </Flex>
        </Card>
    );
};

export default PolicyAssignment;