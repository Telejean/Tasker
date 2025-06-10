import { useState, useEffect } from 'react';
import { Box, Card, Flex, Heading, Button, TextField, TextArea, Select, Text, Table, Checkbox, Badge } from '@radix-ui/themes';
import axios from 'axios';
import { API_URL, axiosConfig } from '@/config/api';
import { LuPlus, LuTrash, LuCopy, LuPlay, LuInfo } from 'react-icons/lu';
import { RuleEffect, UserRoles } from '@my-types/types';

interface PolicyFormData {
    id?: number;
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

interface TestPermissionResult {
    allowed: boolean;
    reason: string;
    appliedRules: string[];
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

    const [showTestModal, setShowTestModal] = useState(false);
    const [testRequest, setTestRequest] = useState({
        userId: '',
        action: '',
        resourceType: '',
        resourceId: '',
        resourceAttributes: '{}'
    });
    const [testResult, setTestResult] = useState<TestPermissionResult | null>(null);

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

    const handleSavePolicy = async () => {
        try {
            setLoading(true);

            if (!policyFormData.name.trim()) {
                setError('Policy name is required');
                return;
            }

            for (let i = 0; i < policyFormData.rules.length; i++) {
                const rule = policyFormData.rules[i];
                if (!rule.name.trim()) {
                    setError(`Rule ${i + 1} name is required`);
                    return;
                }
            }

            const formattedRules = policyFormData.rules.map(rule => ({
                ...rule,
                subjectAttributes: JSON.stringify(rule.subjectAttributes),
                resourceAttributes: JSON.stringify(rule.resourceAttributes),
                actionAttributes: JSON.stringify(rule.actionAttributes)
            }));

            const formattedPolicy = {
                ...policyFormData,
                isActive: policyFormData.isActive, 
                rules: formattedRules
            };

            let response;
            if (selectedPolicy?.id) {
                response = await axios.put(
                    `${API_URL}/policies/${selectedPolicy.id}`,
                    formattedPolicy,
                    axiosConfig
                );
            } else {
                response = await axios.post(
                    `${API_URL}/policies`,
                    formattedPolicy,
                    axiosConfig
                );
            }

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

    const handleAddRule = () => {
        setPolicyFormData(prev => ({
            ...prev,
            rules: [...prev.rules, { ...defaultRule, priority: prev.rules.length }]
        }));
    };

    const handleRemoveRule = (index: number) => {
        setPolicyFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

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

    const handleSubjectAttributeChange = (index: number, field: string, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index].subjectAttributes = {
                ...rules[index].subjectAttributes,
                [field]: value === 'DEFAULT' ? undefined : value
            };
            return { ...prev, rules };
        });
    };

    const handleResourceAttributeChange = (index: number, field: string, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index].resourceAttributes = {
                ...rules[index].resourceAttributes,
                [field]: value === 'DEFAULT' || value === 'default' ? undefined : value
            };
            return { ...prev, rules };
        });
    };

    const handleActionAttributeChange = (index: number, field: string, value: any) => {
        setPolicyFormData(prev => {
            const rules = [...prev.rules];
            rules[index].actionAttributes = {
                ...rules[index].actionAttributes,
                [field]: value === 'DEFAULT' ? undefined : value
            };
            return { ...prev, rules };
        });
    };

    const handleEditPolicy = (policy) => {
        const formattedRules = policy.rules.map(rule => ({
            ...rule,
            subjectAttributes: rule.subjectAttributes ? JSON.parse(rule.subjectAttributes) : {},
            resourceAttributes: rule.resourceAttributes ? JSON.parse(rule.resourceAttributes) : {},
            actionAttributes: rule.actionAttributes ? JSON.parse(rule.actionAttributes) : {}
        }));

        setSelectedPolicy(policy);
        setPolicyFormData({
            id: policy.id,
            name: policy.name,
            description: policy.description || '',
            isActive: policy.isActive,
            rules: formattedRules.length > 0 ? formattedRules : [{ ...defaultRule }]
        });
        setShowPolicyForm(true);
    };

    const handleNewPolicy = () => {
        setSelectedPolicy(null);
        setPolicyFormData(defaultPolicy);
        setShowPolicyForm(true);
    };

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

    const handleClonePolicy = (policy) => {
        const clonedPolicy = {
            ...policy,
            name: `${policy.name} (Copy)`,
            id: undefined
        };
        handleEditPolicy(clonedPolicy);
    };

    const handleTestPolicy = async () => {
        try {
            const { data } = await axios.post(`${API_URL}/policies/test`, {
                ...testRequest,
                resourceAttributes: JSON.parse(testRequest.resourceAttributes)
            }, axiosConfig);
            setTestResult(data);
        } catch (err) {
            console.error('Error testing policy:', err);
            setError('Failed to test policy');
        }
    };

    const handleTogglePolicyStatus = async (policyId: number, currentStatus: boolean) => {
        try {
            await axios.patch(`${API_URL}/policies/${policyId}/status`, {
                isActive: !currentStatus
            }, axiosConfig);

            setPolicies(prev => prev.map(p =>
                p.id === policyId ? { ...p, isActive: !currentStatus } : p
            ));
        } catch (err) {
            console.error('Error toggling policy status:', err);
            setError('Failed to update policy status');
        }
    };

    return (
        <Box width="100%" p="6">
            <Heading as="h1" size="8" mb="6">Policy Management</Heading>

            {error && (
                <Card size="2" style={{ backgroundColor: 'var(--red-3)', borderColor: 'var(--red-6)' }} mb="4">
                    <Text color="red">{error}</Text>
                </Card>
            )}

            {!showPolicyForm ? (
                <Flex direction="column" gap="4">
                    <Flex justify="between" align="center">
                        <Heading as="h2" size="5">Policies</Heading>
                        <Flex gap="2">
                            <Button variant="soft" onClick={() => setShowTestModal(true)}>
                                <LuPlay /> Test Permissions
                            </Button>
                            <Button onClick={handleNewPolicy}>
                                <LuPlus /> New Policy
                            </Button>
                        </Flex>
                    </Flex>

                    {loading ? (
                        <Text>Loading policies...</Text>
                    ) : policies.length === 0 ? (
                        <Card size="3" style={{ textAlign: 'center' }}>
                            <Text size="4" mb="2">No policies found</Text>
                            <Text color="gray" mb="4">Create your first policy to get started with access control.</Text>
                            <Button onClick={handleNewPolicy}>
                                <LuPlus /> Create First Policy
                            </Button>
                        </Card>
                    ) : (
                        <Table.Root>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Rules</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Priority Range</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {policies.map(policy => (
                                    <Table.Row key={policy.id}>
                                        <Table.Cell>
                                            <Text weight="bold">{policy.name}</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="2" color="gray">
                                                {policy.description || '-'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={policy.isActive ? 'green' : 'red'}>
                                                {policy.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge variant="soft">{policy.rules?.length || 0} rules</Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="1" color="gray">
                                                {policy.rules?.length > 0
                                                    ? `${Math.min(...policy.rules.map(r => r.priority))} - ${Math.max(...policy.rules.map(r => r.priority))}`
                                                    : '-'
                                                }
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Flex gap="1">
                                                <Button size="1" variant="soft" onClick={() => handleEditPolicy(policy)}>
                                                    Edit
                                                </Button>
                                                <Button size="1" variant="soft" onClick={() => handleClonePolicy(policy)}>
                                                    <LuCopy />
                                                </Button>
                                                <Button
                                                    size="1"
                                                    variant="soft"
                                                    color={policy.isActive ? 'red' : 'green'}
                                                    onClick={() => handleTogglePolicyStatus(policy.id, policy.isActive)}
                                                >
                                                    {policy.isActive ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button size="1" variant="soft" color="red" onClick={() => handleDeletePolicy(policy.id)}>
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
                                    <Text>Active Policy</Text>
                                </Flex>
                            </Box>

                            <Heading as="h3" size="4" mt="4">Rules</Heading>
                            <Text size="2" color="gray">
                                Rules are evaluated in priority order. Higher priority numbers are evaluated first.
                            </Text>

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
                                            <Heading as="h5" size="2" mb="2">Subject Attributes (Who)</Heading>
                                            <Flex direction="column" gap="2">
                                                <Flex gap="3">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">User Role</Text>
                                                        <Select.Root
                                                            value={rule.subjectAttributes.role || 'DEFAULT'}
                                                            onValueChange={(value) => handleSubjectAttributeChange(index, 'role', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="DEFAULT">Any Role</Select.Item>
                                                                <Select.Item value="MEMBER">Member</Select.Item>
                                                                <Select.Item value="LEADER">Leader</Select.Item>
                                                                <Select.Item value="COORDINATOR">Coordinator</Select.Item>
                                                                <Select.Item value="BOARD">Board</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Department</Text>
                                                        <TextField.Root
                                                            placeholder="Department ID (optional)"
                                                            value={rule.subjectAttributes.departmentId || ''}
                                                            onChange={(e) => handleSubjectAttributeChange(index, 'departmentId', e.target.value)}
                                                        />
                                                    </Box>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        {/* NEW: Action Attributes */}
                                        <Box>
                                            <Heading as="h5" size="2" mb="2">Action Attributes (What Action)</Heading>
                                            <Flex direction="column" gap="2">
                                                <Flex gap="3">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Action Type</Text>
                                                        <Select.Root
                                                            value={rule.actionAttributes.type || 'DEFAULT'}
                                                            onValueChange={(value) => handleActionAttributeChange(index, 'type', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="DEFAULT">Any Action</Select.Item>
                                                                <Select.Item value="create">Create</Select.Item>
                                                                <Select.Item value="read">Read</Select.Item>
                                                                <Select.Item value="update">Update</Select.Item>
                                                                <Select.Item value="delete">Delete</Select.Item>
                                                                <Select.Item value="manage">Manage</Select.Item>
                                                                <Select.Item value="assign">Assign</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        <Box>
                                            <Heading as="h5" size="2" mb="2">Resource Attributes (What Resource)</Heading>
                                            <Flex direction="column" gap="2">
                                                <Flex gap="3">
                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Resource Type</Text>
                                                        <Select.Root
                                                            value={rule.resourceAttributes.type || 'default'}
                                                            onValueChange={(value) => handleResourceAttributeChange(index, 'type', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="default">Any Type</Select.Item>
                                                                <Select.Item value="project">Project</Select.Item>
                                                                <Select.Item value="task">Task</Select.Item>
                                                                <Select.Item value="user">User</Select.Item>
                                                                <Select.Item value="team">Team</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>

                                                    <Box style={{ flex: 1 }}>
                                                        <Text as="div" size="2" weight="bold" mb="1">Status</Text>
                                                        <Select.Root
                                                            value={rule.resourceAttributes.status || 'DEFAULT'}
                                                            onValueChange={(value) => handleResourceAttributeChange(index, 'status', value)}
                                                        >
                                                            <Select.Trigger />
                                                            <Select.Content>
                                                                <Select.Item value="DEFAULT">Any Status</Select.Item>
                                                                <Select.Item value="ACTIVE">Active</Select.Item>
                                                                <Select.Item value="ARCHIVED">Archived</Select.Item>
                                                                <Select.Item value="DELETED">Deleted</Select.Item>
                                                                <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
                                                                <Select.Item value="COMPLETED">Completed</Select.Item>
                                                                <Select.Item value="NOT_STARTED">Not Started</Select.Item>
                                                            </Select.Content>
                                                        </Select.Root>
                                                    </Box>
                                                </Flex>
                                            </Flex>
                                        </Box>

                                        <Box>
                                            <Flex align="center" gap="2" mb="1">
                                                <Text as="div" size="2" weight="bold">Condition (JSONata expression)</Text>
                                                <LuInfo size={14} />
                                            </Flex>
                                            <TextArea
                                                placeholder="Enter condition expression"
                                                value={rule.condition}
                                                onChange={(e) => handleRuleChange(index, 'condition', e.target.value)}
                                            />
                                            <Text size="1" color="gray" mt="1">
                                                Examples:<br />
                                                • <code>subject.userId = resource.creatorId</code> (creator can edit)<br />
                                                • <code>subject.departmentId = resource.departmentId</code> (same department)<br />
                                                • <code>resource.priority = "HIGH" and subject.role = "LEADER"</code>
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
                                        setError('');
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

            {/* NEW: Test Modal */}
            {showTestModal && (
                <Box
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <Card size="3" style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
                        <Heading as="h3" size="4" mb="4">Test Permission</Heading>

                        <Flex direction="column" gap="3">
                            <TextField.Root
                                placeholder="User ID"
                                value={testRequest.userId}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, userId: e.target.value }))}
                            />
                            <TextField.Root
                                placeholder="Action (e.g., create, read, update)"
                                value={testRequest.action}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, action: e.target.value }))}
                            />
                            <TextField.Root
                                placeholder="Resource Type (e.g., project, task)"
                                value={testRequest.resourceType}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, resourceType: e.target.value }))}
                            />
                            <TextField.Root
                                placeholder="Resource ID (optional)"
                                value={testRequest.resourceId}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, resourceId: e.target.value }))}
                            />
                            <TextArea
                                placeholder='Resource Attributes (JSON, e.g., {"status": "ACTIVE"})'
                                value={testRequest.resourceAttributes}
                                onChange={(e) => setTestRequest(prev => ({ ...prev, resourceAttributes: e.target.value }))}
                            />
                        </Flex>

                        {testResult && (
                            <Box mt="4" p="3" style={{ backgroundColor: testResult.allowed ? 'var(--green-3)' : 'var(--red-3)', borderRadius: '4px' }}>
                                <Text weight="bold" color={testResult.allowed ? 'green' : 'red'}>
                                    {testResult.allowed ? '✅ ALLOWED' : '❌ DENIED'}
                                </Text>
                                <Text size="2" mt="1" style={{ display: 'block' }}>
                                    Reason: {testResult.reason}
                                </Text>
                                {testResult.appliedRules && testResult.appliedRules.length > 0 && (
                                    <Text size="1" mt="1" style={{ display: 'block' }}>
                                        Applied rules: {testResult.appliedRules.join(', ')}
                                    </Text>
                                )}
                            </Box>
                        )}

                        <Flex gap="3" mt="4" justify="end">
                            <Button variant="soft" color="gray" onClick={() => {
                                setShowTestModal(false);
                                setTestResult(null);
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleTestPolicy}>
                                Test Permission
                            </Button>
                        </Flex>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default PolicyManagement;