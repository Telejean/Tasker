import { Box, Flex, Text, Badge, Dialog, TextField, TextArea, Select, Button } from '@radix-ui/themes';
import { CalendarDatePicker } from '../DatePicker/CalendarDatePicker';
import { use, useEffect, useState } from 'react';
import { parseDate } from '@internationalized/date';
import { Task } from '@/types';

const TaskDetailDialog = ({ task, open, onOpenChange, onTaskUpdate } : {task: Task, open: boolean, onOpenChange: React.Dispatch<React.SetStateAction<boolean>>, onTaskUpdate: (task: Task) => void }) => {
    const [editedTask, setEditedTask] = useState({ ...task });

    useEffect(() => {
        setEditedTask({ ...task });
    }, [open, task]);

    const getCalendarDate = (dateString) => {
        try {
            return parseDate(dateString);
        } catch (e) {
            console.error('Invalid date format:', e);
            return null;
        }
    };

    const handleStatusChange = (value) => {
        setEditedTask(prev => ({
            ...prev,
            status: value
        }));
    };

    const handleDateChange = (date) => {
        setEditedTask(prev => ({
            ...prev,
            deadline: date
        }));
    };

    const handleSave = () => {
        onTaskUpdate(editedTask);
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content style={{ maxWidth: '500px' }}>
                <Dialog.Title>Task Details</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    View and edit task information
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Task Name
                        </Text>
                        <TextField.Root
                            value={editedTask.name}
                            onChange={(e) => setEditedTask(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Description
                        </Text>
                        <TextArea
                            value={editedTask.description}
                            onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Status
                        </Text>
                        <Select.Root
                            value={editedTask.status}
                            onValueChange={handleStatusChange}
                        >
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Item value="not-started">Not Started</Select.Item>
                                <Select.Item value="in-progress">In Progress</Select.Item>
                                <Select.Item value="completed">Completed</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Deadline
                        </Text>
                        <CalendarDatePicker
                            defaultValue={editedTask.deadline.toString()}
                            onDateChange={handleDateChange}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project
                        </Text>
                        <TextField.Root
                            value={editedTask.projectName}
                            onChange={(e) => setEditedTask(prev => ({ ...prev, projectName: e.target.value }))}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Assignee
                        </Text>
                        <TextField.Root
                            value={editedTask.assignedPeople}
                            onChange={(e) => setEditedTask(prev => ({ ...prev, assignedPeople: e.target.value }))}
                        />
                    </label>

                    {editedTask.assignedPeople && (
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Collaborators
                            </Text>
                            <Flex gap="1" wrap="wrap">
                                {editedTask.assignedPeople.map((collaborator, index) => (
                                    <Badge key={index} variant="soft">
                                        {collaborator}
                                    </Badge>
                                ))}
                            </Flex>
                        </Box>
                    )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default TaskDetailDialog;