import { Button, Callout, Dialog, Flex, Select, TextArea, TextField, Text, Box } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import { LuCirclePlus, LuX } from "react-icons/lu";
import { CalendarDatePicker } from "../DatePicker/CalendarDatePicker";
import { projectService } from "@/services/project.service";
import * as LuIcons from "react-icons/lu";
import { Project, Task } from "@my-types/types";
import { userService } from "@/services/user.service";
import { taskService } from "@/services/task.service";
import { useAtom } from "jotai";
import { userAtom } from "@/App";
import { serializeDate } from "@/services/date.service";

export const TasksAdd = ({ onAddTask, projectId, }: {
    onAddTask: (cb: (prev: any[]) => any[]) => void;
    selectedProjectId?: number;
}) => {
    const [taskName, setTaskName] = useState("");
    const [deadline, setDeadline] = useState("");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
    const [showWarning, setShowWarning] = useState(false);
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [collaboratorSearch, setCollaboratorSearch] = useState("");
    const [user] = useAtom(userAtom);
    const [priority, setPriority] = useState("MEDIUM");


    useEffect(() => {
        const fetchProjects = async () => {
            const projectsRes = await projectService.getMyProjects();
            setAvailableProjects(projectsRes);
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (projectId) {
                try {
                    const users = await userService.getUsersFromProject(projectId);
                    setAllUsers(users);
                } catch (e) {
                    setAllUsers([]);
                }
            } else {
                try {
                    const users = await userService.getAllUsers();
                    setAllUsers(users);
                } catch (e) {
                    setAllUsers([]);
                }
            }
        };
        fetchUsers();
    }, [selectedProjectId]);



    const handleSave = async (event: any) => {
        if (
            !taskName ||
            !deadline ||
            !description ||
            !(selectedProjectId || selectedProjectId)
        ) {
            setShowWarning(true);
            event.preventDefault();
            return;
        }
        event.preventDefault();
        let collaboratorsToSend = [...collaborators];
        if (!projectId && user) {
            collaboratorsToSend = [
                user.id,
                ...collaboratorsToSend.filter((id) => id !== user.id),
            ];
        }
        let newTask: Task = {
            name: taskName,
            deadline: serializeDate(deadline).toISOString(),
            creatorId: user.id,
            description: description,
            projectId: projectId || parseInt(selectedProjectId),
            assignedPeople: collaboratorsToSend,
            priority: priority,
        };
        try {
            const createdTask = await taskService.createTask(newTask);
            const formattedTask = taskService.formatTask([createdTask]);
            onAddTask((prevData) => [...prevData, formattedTask[0]]);
        } catch (e) {
            console.log(e);
            setShowWarning(true);
            return;
        }
        setTaskName("");
        setDeadline("");
        setDescription("");
        setSelectedProjectId("");
        setCollaborators([]);
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Button size="3">
                    <LuCirclePlus size="1.5em" strokeWidth={3} />
                    Add task
                </Button>
            </Dialog.Trigger>

            <Dialog.Content
                maxWidth="600px"
                onCloseAutoFocus={() => setShowWarning(false)}
            >
                <Dialog.Title>Add task</Dialog.Title>

                <Flex direction="column" gap="3">
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
                        <CalendarDatePicker onChange={(date: any) => setDeadline(date)} />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Description
                        </Text>
                        <TextArea
                            placeholder="Task description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Project
                        </Text>
                        {projectId ? (
                            <Flex align="center" gap="2">
                                {(() => {
                                    const selectedProject = availableProjects.find(
                                        (p) => p.id === projectId
                                    );
                                    const IconComponent =
                                        selectedProject &&
                                        LuIcons[selectedProject.icon as keyof typeof LuIcons];
                                    return IconComponent
                                        ? React.createElement(IconComponent, { size: 20 })
                                        : null;
                                })()}
                                <Text>
                                    {availableProjects.find((p) => p.id === projectId)?.name ||
                                        "Selected Project"}
                                </Text>
                            </Flex>
                        ) : (
                            <Select.Root
                                value={selectedProjectId}
                                onValueChange={setSelectedProjectId}
                            >
                                <Select.Trigger placeholder="Select project" />
                                <Select.Content>
                                    {availableProjects &&
                                        availableProjects.map((project) => (
                                            <Select.Item
                                                key={project.id}
                                                value={project.id.toString()}
                                            >
                                                <Flex as="span" align="center" gap="2">
                                                    {(() => {
                                                        const IconComponent =
                                                            LuIcons[project.icon as keyof typeof LuIcons];
                                                        return IconComponent
                                                            ? React.createElement(IconComponent, { size: 20 })
                                                            : null;
                                                    })()}
                                                    {project.name}
                                                </Flex>
                                            </Select.Item>
                                        ))}
                                </Select.Content>
                            </Select.Root>
                        )}
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Priority
                        </Text>
                        <Select.Root value={priority} onValueChange={setPriority}>
                            <Select.Trigger placeholder="Select priority" />
                            <Select.Content>
                                <Select.Item value="HIGH">High</Select.Item>
                                <Select.Item value="MEDIUM">Medium</Select.Item>
                                <Select.Item value="LOW">Low</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Collaborators
                        </Text>
                        <TextField.Root
                            placeholder="Search users..."
                            value={collaboratorSearch}
                            onChange={(e) => setCollaboratorSearch(e.target.value)}
                        />
                        <Flex gap="2" wrap="wrap" mt="2">
                            {collaborators.map((collabId) => {
                                const userObj = allUsers.find(
                                    (u) => u.id.toString() === collabId
                                );
                                return (
                                    <Flex
                                        key={collabId}
                                        align="center"
                                        px="2"
                                        py="1"
                                        style={{ background: "#eee", borderRadius: 8 }}
                                        gap="1"
                                    >
                                        <Text size="2">{`${userObj.name} ${userObj.surname}`}</Text>
                                        <Button
                                            variant="ghost"
                                            color="red"
                                            size="1"
                                            onClick={() =>
                                                setCollaborators(
                                                    collaborators.filter((id) => id !== collabId)
                                                )
                                            }
                                        >
                                            <LuX />
                                        </Button>
                                    </Flex>
                                );
                            })}
                        </Flex>
                        <Box mt="2" style={{ maxHeight: 120, overflowY: "auto" }}>
                            {allUsers
                                .filter(
                                    (u) =>
                                        u.name
                                            .toLowerCase()
                                            .includes(collaboratorSearch.toLowerCase()) &&
                                        !collaborators.includes(u.id.toString())
                                )
                                .map((u) => (
                                    <Button
                                        key={u.id}
                                        variant="ghost"
                                        size="1"
                                        style={{ width: "100%", justifyContent: "flex-start" }}
                                        onClick={() =>
                                            setCollaborators([...collaborators, u.id.toString()])
                                        }
                                    >
                                        {`${u.name} ${u.surname} (${u.email})`}
                                    </Button>
                                ))}
                        </Box>
                    </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Cancel
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button onClick={(e) => handleSave(e)}>Save</Button>
                    </Dialog.Close>
                </Flex>
                {showWarning && (
                    <Callout.Root>
                        <Callout.Icon></Callout.Icon>
                        <Callout.Text>You need to fill all the fields</Callout.Text>
                    </Callout.Root>
                )}
            </Dialog.Content>
        </Dialog.Root>
    );
};
