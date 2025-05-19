import { useState, useEffect } from 'react';
import { Box, Card, Flex, Heading, Button, TextField, TextArea, Select, Text, Table, Checkbox } from '@radix-ui/themes';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';
import { LuPlus, LuTrash } from 'react-icons/lu';
import { RuleEffect, UserRoles } from '@my-types/types';

interface PolicyFormData {
    name: string;
    description: string;
    isActive: boolean;
    rules: RuleFormData[];
}

interface RuleFormData {
    id?: number;
    name: string;
    description: string;
    effect: keyof typeof RuleEffect;
    priority: number;
    subjectAttributes: any;
    resourceAttributes: any;
    actionAttributes: any;
    condition: string;
}

const defaultRule: RuleFormData = {
    name: '',
    description: '',
    effect: 'ALLOW',
    priority: 0,
    subjectAttributes: {},
    resourceAttributes: {},
    actionAttributes: {},
    condition: ''
};

const defaultPolicy: PolicyFormData = {
    name: '',
    description: '',
    isActive: true,
    rules: [{ ...defaultRule }]
};

const PolicyManagement = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyFormData | null>(null);
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [policyFormData, setPolicyFormData] = useState<PolicyFormData>(defaultPolicy);

    // Fetch policies when component mounts
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_URL}/policies`, axiosConfig);
                setPolicies(data);
            } catch (err) {
                console.error('Error fetching policies:', err);
                setError('Failed to load policies');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    // Handle creating/updating a policy
    const handleSavePolicy = async () => {
        try {
            setLoading(true);

            // Validate policy data
            if (!policyFormData.name.trim()) {
                setError('Policy name is required');
                return;
            }

            // Format rule attributes as JSON strings
            const formattedRules = policyFormData.rules.map(rule => ({
                ...rule,
                subjectAttributes: JSON.stringify(rule.subjectAttributes),
                resourceAttributes: JSON.stringify(rule.resourceAttributes),
                actionAttributes: JSON.stringify(rule.actionAttributes)
            }));

            const formattedPolicy = {
                ...policyFormData,
                rules: formattedRules
            };

            let response;
            if (selectedPolicy?.id) {
                // Update existing policy
                response = await axios.put(
                    `${API_URL}/policies/${selectedPolicy.id}`,
                    formattedPolicy,
                    axiosConfig
                );
            } else {
                // Create new policy
                response = await axios.post(
                    `${API_URL}/policies`,
                    formattedPolicy,
                    axiosConfig
                );
            }

            // Refresh policies list
            setPolicies(prev => {
                if (selectedPolicy?.id) {
                    return prev.map(p => p.id === selectedPolicy.id ? response.data : p);
                } else {
                    return [...prev, response.data];
                }
            });

            setShowPolicyForm(false);
            setPolicyFormData(defaultPolicy);
            setSelectedPolicy(null);
            setError('');
        } catch (err) {
            console.error('Error saving policy:', err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Failed to save policy');
            } else {
                setError('Failed to save policy');
            }
        } finally {
            setLoading(false);
        }
    };

    // Add a new rule to the current policy
    const handleAddRule = () => {
        setPolicyFormData(prev => ({
            ...prev,
            rules: [...prev.rules, { ...defaultRule }]
        }));
    };

    // Remove a rule from the current policy
    const handleRemoveRule = (index: number) => {
        setPolicyFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    // Update rule field
    const handleRuleChange = (index: number, field: keyof RuleFormData, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index] = {
                ...rules[index],
                [field]: value
            };
            return { ...prev, rules };
        });
    };

    // Update subject attributes
    const handleSubjectAttributeChange = (index: number, field: string, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index].subjectAttributes = {
                ...rules[index].subjectAttributes,
                [field]: value
            };
            return { ...prev, rules };
        });
    };

    // Update resource attributes
    const handleResourceAttributeChange = (index: number, field: string, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index].resourceAttributes = {
                ...rules[index].resourceAttributes,
                [field]: value
            };
            return { ...prev, rules };
        });
    };

    // Edit an existing policy
    const handleEditPolicy = (policy) => {
        // Format the rule attributes from JSON strings back to objects
        const formattedRules = policy.rules.map(rule => ({
            ...rule,
            subjectAttributes: rule.subjectAttributes ? JSON.parse(rule.subjectAttributes) : {},
            resourceAttributes: rule.resourceAttributes ? JSON.parse(rule.resourceAttributes) : {},
            actionAttributes: rule.actionAttributes ? JSON.parse(rule.actionAttributes) : {}
        }));

        setSelectedPolicy(policy);
        setPolicyFormData({
            name: policy.name,
            description: policy.description || '',
            isActive: policy.isActive,
            rules: formattedRules.length > 0 ? formattedRules : [{ ...defaultRule }]
        });
        setShowPolicyForm(true);
    };

    // Create a new policy
    const handleNewPolicy = () => {
        setSelectedPolicy(null);
        setPolicyFormData(defaultPolicy);
        setShowPolicyForm(true);
    };

    // Delete a policy
    const handleDeletePolicy = async (policyId: number) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/policies/${policyId}`, axiosConfig);
            setPolicies(prev => prev.filter(p => p.id !== policyId));
        } catch (err) {
            console.error('Error deleting policy:', err);
            setError('Failed to delete policy');
        }
    };

    return (
        <Box width="100%" p="6">
            <Heading as="h1" size="8" mb="6">Policy Management</Heading>

            {error && (
                <Card size="2" color="red" mb="4">
                    <Text color="red">{error}</Text>
                </Card>
            )}

            {!showPolicyForm ? (
                <Flex direction="column" gap="4">
                    <Flex justify="between" align="center">
                        <Heading as="h2" size="5">Policies</Heading>
                        <Button onClick={handleNewPolicy}>
                            <LuPlus /> New Policy
                        </Button>
                    </Flex>

                    {loading ? (
                        <Text>Loading policies...</Text>
                    ) : policies.length === 0 ? (
                        <Text>No policies found. Create your first policy to get started.</Text>
                    ) : (
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Rules</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {policies.map(policy => (
                                    <Table.Row key={policy.id}>
                                        <Table.Cell>{policy.name}</Table.Cell>
                                        <Table.Cell>{policy.description || '-'}</Table.Cell>
                                        <Table.Cell>
                                            <Text color={policy.isActive ? 'green' : 'red'}>
                                                {policy.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>{policy.rules?.length || 0}</Table.Cell>
                                        <Table.Cell>
                                            <Flex gap="2">
                                                <Button variant="soft" onClick={() => handleEditPolicy(policy)}>
                                                    Edit
                                                </Button>
                                                <Button variant="soft" color="red" onClick={() => handleDeletePolicy(policy.id)}>
                                                    <LuTrash />
                                                </Button>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    )}
                </Flex>
            ) : (
                <Card size="3">
                    <Flex direction="column" gap="4">
                        <Heading as="h2" size="5">
                            {selectedPolicy ? `Edit Policy: ${selectedPolicy.name}` : 'Create New Policy'}
                        </Heading>

                        <Flex direction="column" gap="3">
                            <Box>
                                <Text as="div" size="2" weight="bold" mb="1">Policy Name</Text>
                                <TextField.Root
                                    placeholder="Enter policy name"
                                    value={policyFormData.name}
                                    onChange={(e) => setPolicyFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </Box>

                            <Box>
                                <Text as="div" size="2" weight="bold" mb="1">Description</Text>
                                <TextArea
                                    placeholder="Enter policy description"
                                    value={policyFormData.description}
                                    onChange={(e) => setPolicyFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </Box>

                            <Box>
                                <Flex align="center" gap="2">
                                    <Checkbox
                                        checked={policyFormData.isActive}
                                        onCheckedChange={(checked) =>
                                            setPolicyFormData(prev => ({ ...prev, isActive: !!checked }))
                                        }
                                    />
                                    <Text>Active</Text>
                                </Flex>
                            </Box>

                            <Heading as="h3" size="4" mt="4">Rules</Heading>

                            {policyFormData.rules.map((rule, index) => (
                                <Card key={index} size="2" style={{ marginBottom: '16px' }}>
                                    <Flex justify="between" align="center" mb="2">
                                        <Heading as="h4" size="3">Rule {index + 1}</Heading>
                                        <Button
                                            variant="soft"
                                            color="red"
                                            onClick={() => handleRemoveRule(index)}
                                            disabled={policyFormData.rules.length <= 1}
                                        >
                                            <LuTrash />
                                        </Button>
                                    </Flex>

                                    <Flex direction="column" gap="3">
                                        <Box>
                                            <Text as="div" size="2" weight="bold" mb="1">Rule Name</Text>
                                            <TextField.Root
                                                placeholder="Enter rule name"
                                                value={rule.name}
                                                onChange={(e) => handleRuleChange(index, 'name', e.target.value)}
                                            />
                                        </Box>

                                        <Box>
                                            <Text as="div" size="2" weight="bold" mb="1">Description</Text>
                                            <TextArea
                                                placeholder="Enter rule description"
                                                value={rule.description}
                                                onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                                            />
                                        </Box>

                                        <Flex gap="3">
                                            <Box style={{ flex: 1 }}>
                                                <Text as="div" size="2" weight="bold" mb="1">Effect</Text>
                                                <Select.Root
                                                    value={rule.effect}
                                                    onValueChange={(value) => handleRuleChange(index, 'effect', value)}
                                                >
                                                    <Select.Trigger />
                                                    <Select.Content>
                                                        <Select.Item value="ALLOW">Allow</Select.Item>
                                                        <Select.Item value="DENY">Deny</Select.Item>
                                                    </Select.Content>
                                                </Select.Root>
                                            </Box>

                                            <Box style={{ flex: 1 }}>
                                                <Text as="div" size="2" weight="bold" mb="1">Priority</Text>
                                                <TextField.Root
                                                    type="number"
                                                    value={rule.priority.toString()}
                                                    onChange={(e) => handleRuleChange(index, 'priority', parseInt(e.target.value) || 0)}
                                                />
                                            </Box>
                                        </Flex>

                                        <Box>
                                            <Heading as="h5" size="2" mb="2">Subject Attributes</Heading>

                                            <Flex direction="column" gap="2">
                                                <Flex gap="3">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">User Role</Text>
                                                        <Select.Root
                                                            value={rule.subjectAttributes.role || ''}
                                                            onValueChange={(value) => handleSubjectAttributeChange(index, 'role', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="">Any Role</Select.Item>
                                                                <Select.Item value="MEMBER">Member</Select.Item>
                                                                <Select.Item value="LEADER">Leader</Select.Item>
                                                                <Select.Item value="COORDINATOR">Coordinator</Select.Item>
                                                                <Select.Item value="BOARD">Board</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        <Box>
                                            <Heading as="h5" size="2" mb="2">Resource Attributes</Heading>

                                            <Flex direction="column" gap="2">
                                                <Flex gap="3">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Resource Type</Text>
                                                        <Select.Root
                                                            value={rule.resourceAttributes.type || ''}
                                                            onValueChange={(value) => handleResourceAttributeChange(index, 'type', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="">Any Type</Select.Item>
                                                                <Select.Item value="project">Project</Select.Item>
                                                                <Select.Item value="task">Task</Select.Item>
                                                                <Select.Item value="user">User</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>

                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Status</Text>
                                                        <Select.Root
                                                            value={rule.resourceAttributes.status || ''}
                                                            onValueChange={(value) => handleResourceAttributeChange(index, 'status', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="">Any Status</Select.Item>
                                                                <Select.Item value="ACTIVE">Active</Select.Item>
                                                                <Select.Item value="ARCHIVED">Archived</Select.Item>
                                                                <Select.Item value="DELETED">Deleted</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        <Box>
                                            <Text as="div" size="2" weight="bold" mb="1">Condition (JSONata expression)</Text>
                                            <TextArea
                                                placeholder="Enter condition expression"
                                                value={rule.condition}
                                                onChange={(e) => handleRuleChange(index, 'condition', e.target.value)}
                                            />
                                            <Text size="1" color="gray" mt="1">
                                                Example: subject.userId = resource.creatorId (creator can edit their content)
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Card>
                            ))}

                            <Button onClick={handleAddRule} variant="soft">
                                <LuPlus /> Add Rule
                            </Button>

                            <Flex gap="3" mt="4" justify="end">
                                <Button
                                    variant="soft"
                                    color="gray"
                                    onClick={() => {
                                        setShowPolicyForm(false);
                                        setPolicyFormData(defaultPolicy);
                                        setSelectedPolicy(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSavePolicy} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Policy'}
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </Card>
            )}
        </Box>
    );
};

export default PolicyManagement;