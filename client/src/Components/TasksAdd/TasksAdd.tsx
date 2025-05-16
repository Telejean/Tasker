import { Button, Callout, Dialog, Flex, Select, TextArea, TextField, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { LuCirclePlus } from 'react-icons/lu';
import { CalendarDatePicker } from '../DatePicker/CalendarDatePicker';
import { projectService } from '@/services/project.service';
import * as LuIcons from 'react-icons/lu';
import { Project } from '@/types';

export const TasksAdd = ({ onAddTask }) => {
    const [taskName, setTaskName] = useState('');
    const [deadline, setDeadline] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [project, setProject] = useState('');
    const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            const projectsRes = await projectService.getMyProjects();
            console.log(projectsRes)
            setAvailableProjects(projectsRes);
        }

        fetchProjects()

        console.log(LuIcons)
    }, [])

    const formatDate = (date) => {
        const day = date.day;
        const month = date.month;
        const year = date.year;
        return `${day}/${month}/${year}`;
    };

    const handleSave = (event) => {
        if (!taskName || !deadline || !description || !status || !project) {
            setShowWarning(true);
            event.preventDefault();

            return;
        }


        let newTask = {
            name: taskName,
            deadline: formatDate(deadline),
            description: description,
            status: status,
            project: project,
            collaborators: [],
        }
        onAddTask((prevData) => [...prevData, newTask]);

        setTaskName('');
        setDeadline({});
        setDescription('');
        setStatus('');
        setProject('');
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="3">
                    <LuCirclePlus size="1.5em" strokeWidth={3} />
                    Add task
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px" onCloseAutoFocus={() => setShowWarning(false)}>
                <Dialog.Title>Add task</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Add a new task
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    {/* Task Name */}
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Name
                        </Text>
                        <TextField.Root
                            placeholder="Task name"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Deadline
                        </Text>
                        <CalendarDatePicker onChange={(date) => setDeadline(date)} />
                    </label>

                    {/* Description */}
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Descriere
                        </Text>
                        <TextArea
                            placeholder="Task description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>

                    {/* Status */}
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Status
                        </Text>
                        <Select.Root value={status} onValueChange={setStatus}>
                            <Select.Trigger placeholder="Select status" />
                            <Select.Content>
                                <Select.Item value="not_started">Not Started</Select.Item>
                                <Select.Item value="in_progress">In Progress</Select.Item>
                                <Select.Item value="completed">Completed</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </label>

                    {/* Project */}
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project
                        </Text>
                        <Select.Root value={project} onValueChange={setProject}>
                            <Select.Trigger placeholder="Select project" />
                            <Select.Content>
                                {
                                    availableProjects && availableProjects.map((project) => (
                                        <Select.Item key={project.id} value={project.id}>
                                            <Flex as="span" align="center" gap="2">
                                                {LuIcons[project.icon] && React.createElement(LuIcons[project.icon], { size: 20 })}
                                                {project.name}
                                            </Flex>
                                        </Select.Item>
                                    ))
                                }
                            </Select.Content>
                        </Select.Root>
                    </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                        <Button onClick={(e) => handleSave(e)}>Save</Button>
                    </Dialog.Close>
                </Flex>
                {
                    showWarning &&
                    <Callout.Root>
                        <Callout.Icon>
                        </Callout.Icon>
                        <Callout.Text>
                            You will need admin privileges to install and access this application.
                        </Callout.Text>
                    </Callout.Root>
                }



            </Dialog.Content>
        </Dialog.Root >
    );
};