import { Box, Flex, Text, Badge, TextField, TextArea, Select, Button, Card, Heading, Separator } from "@radix-ui/themes";
import { CalendarDatePicker } from "../../Components/DatePicker/CalendarDatePicker";
import { CommentSection } from "../../Components/Comments/CommentSection";
import React, { useEffect, useState } from "react";
import { DateValue, parseDate } from "@internationalized/date";
import { Task, User, Project } from "@my-types/types";
import { taskService } from "../../services/task.service";
import { userService } from "../../services/user.service";
import { projectService } from "../../services/project.service";
import { useParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPen, LuSave, LuX } from "react-icons/lu";
import * as LuIcons from "react-icons/lu";
import { userAtom } from "@/App";
import { useAtom } from "jotai";

type TaskWithDateValue = Omit<Task, "deadline"> & { deadline: DateValue };

export const TaskDetail = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [editedTask, setEditedTask] = useState<TaskWithDateValue | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [collaboratorSearch, setCollaboratorSearch] = useState("");
    const [currentUser] = useAtom(userAtom);


    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) return;

            try {
                setLoading(true);
                const taskData = await taskService.getTaskById(parseInt(taskId));
                setTask(taskData);

                console.log(taskData.deadline)

                setEditedTask({
                    ...taskData,
                    deadline: parseDate(taskData.deadline.slice(0, 10)),
                });

                if (taskData.assignedUsers) {
                    setCollaborators(taskData.assignedUsers.map(user => user.id.toString()));
                }

                if (taskData.projectId) {
                    const users = await userService.getUsersFromProject(taskData.projectId);
                    setAllUsers(users);
                }
            } catch (err) {
                setError("Failed to load task");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    const handleDateChange = (date: DateValue) => {
        if (!editedTask) return;
        setEditedTask(prev => prev ? { ...prev, deadline: date } : null);
    };

    const handleStatusChange = (value: string) => {
        if (!editedTask) return;
        setEditedTask(prev => prev ? { ...prev, status: value } : null);
    };

    const handlePriorityChange = (value: string) => {
        if (!editedTask) return;
        setEditedTask(prev => prev ? { ...prev, priority: value } : null);
    };

    const handleSave = async () => {
        if (!editedTask || !task) return;

        try {
            const updatedTask = {
                ...editedTask,
                deadline: taskService.dateValueToString(editedTask.deadline),
                assignedPeople: collaborators.map(id => parseInt(id))
            };
            if (updatedTask.id) {
                await taskService.updateTask(updatedTask.id, updatedTask);
            } else {
                console.log("Invalid Task", updatedTask)
            }

            if (task.id) {
                const refreshedTask = await taskService.getTaskById(task.id);
                setTask(refreshedTask);
                setIsEditing(false);
            } else {
                console.log("Invalid Task", updatedTask)
            }

        } catch (err) {
            setError("Failed to save task");
            console.error(err);
        }
    };

    const handleCancel = () => {
        if (!task) return;
        setEditedTask({
            ...task,
            deadline: parseDate(task.deadline.slice(0, 10)),
        });
        setCollaborators(task.assignedUsers?.map(user => user.id.toString()) || []);
        setIsEditing(false);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "red";
            case "MEDIUM": return "yellow";
            case "LOW": return "green";
            default: return "gray";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED": return "green";
            case "IN_PROGRESS": return "blue";
            case "NOT_STARTED": return "gray";
            default: return "gray";
        }
    };

    if (loading) {
        return (
            <Box p="6">
                <Text>Loading task...</Text>
            </Box>
        );
    }

    if (error || !task || !editedTask) {
        return (
            <Box p="6">
                <Text color="red">{error || "Task not found"}</Text>
                <Button mt="4" onClick={() => navigate(-1)}>
                    <LuArrowLeft /> Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box p="6" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <Flex justify="between" align="center" mb="6">
                <Flex align="center" gap="4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        <LuArrowLeft size={20} />
                    </Button>
                    <Heading size="6">{isEditing ? "Edit Task" : "Task Details"}</Heading>
                </Flex>

                <Flex gap="2">
                    {isEditing ? (
                        <>
                            <Button variant="soft" color="gray" onClick={handleCancel}>
                                <LuX /> Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                <LuSave /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <LuPen /> Edit Task
                        </Button>
                    )}
                </Flex>
            </Flex>

            <Flex gap="6" direction={{ initial: "column", md: "row" }}>
                {/* Main Content */}
                <Box style={{ flex: 1 }}>
                    <Card size="3" mb="4">
                        <Flex direction="column" gap="4">
                            {/* Task Name */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Task Name
                                </Text>
                                {isEditing ? (
                                    <TextField.Root
                                        value={editedTask.name}
                                        onChange={(e) =>
                                            setEditedTask(prev => prev ? { ...prev, name: e.target.value } : null)
                                        }
                                    />
                                ) : (
                                    <Heading size="4">{task.name}</Heading>
                                )}
                            </Box>

                            <Separator />

                            {/* Description */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Description
                                </Text>
                                {isEditing ? (
                                    <TextArea
                                        value={editedTask.description || ""}
                                        onChange={(e) =>
                                            setEditedTask(prev => prev ? {
                                                ...prev,
                                                description: e.target.value,
                                            } : null)
                                        }
                                        style={{ minHeight: "120px" }}
                                    />
                                ) : (
                                    <Text size="3">{task.description || "No description provided"}</Text>
                                )}
                            </Box>

                            <Separator />

                            {/* Project Info */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Project
                                </Text>
                                {task.project ? (
                                    <Flex
                                        align="center"
                                        gap="2"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => navigate(`/projects/${task.project?.id}`)}
                                    >
                                        {(() => {
                                            const IconComponent = task.project?.icon &&
                                                LuIcons[task.project.icon as keyof typeof LuIcons];
                                            return IconComponent
                                                ? React.createElement(IconComponent, { size: 20 })
                                                : null;
                                        })()}
                                        <Text size="3" style={{ color: "var(--accent-9)", textDecoration: "underline" }}>
                                            {task.project.name}
                                        </Text>
                                    </Flex>
                                ) : (
                                    <Text size="3" color="gray">No project assigned</Text>
                                )}
                            </Box>
                        </Flex>
                    </Card>

                    {/* Collaborators */}
                    <Card size="3">
                        <Flex justify="between" align="center" mb="3">
                            <Text as="div" size="2" weight="bold">
                                Collaborators
                            </Text>
                            {!isEditing && (
                                <Button
                                    size="1"
                                    variant="soft"
                                    onClick={async () => {
                                        try {
                                            const isAlreadyCollaborator = task.assignedUsers?.some(user => user.id === currentUser.id);

                                            if (!isAlreadyCollaborator && task.id) {
                                                await taskService.addUserToTask(task.id, currentUser.id);

                                                const refreshedTask = await taskService.getTaskById(task.id);
                                                setTask(refreshedTask);
                                            }
                                        } catch (err) {
                                            console.error("Failed to join task:", err);
                                            setError("Failed to join task");
                                        }
                                    }}
                                    disabled={(() => {

                                        const currentUserId = currentUser.id;
                                        return task.assignedUsers?.some(user => user.id === currentUserId);
                                    })()}
                                >
                                    {(() => {
                                        const currentUserId = currentUser.id;
                                        const isAlreadyMember = task.assignedUsers?.some(user => user.id === currentUserId);
                                        return isAlreadyMember ? "Joined" : "Join";
                                    })()}
                                </Button>
                            )}
                        </Flex>

                        {isEditing ? (
                            <Box>
                                <TextField.Root
                                    placeholder="Search users..."
                                    value={collaboratorSearch}
                                    onChange={(e) => setCollaboratorSearch(e.target.value)}
                                    mb="3"
                                />

                                <Flex gap="2" wrap="wrap" mb="3">
                                    {collaborators.map((collabId) => {
                                        const userObj = allUsers.find(u => u.id.toString() === collabId);
                                        if (!userObj) return null;

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
                                                        setCollaborators(collaborators.filter(id => id !== collabId))
                                                    }
                                                >
                                                    <LuX />
                                                </Button>
                                            </Flex>
                                        );
                                    })}
                                </Flex>

                                <Box style={{ maxHeight: 120, overflowY: "auto" }}>
                                    {allUsers
                                        .filter(u =>
                                            u.name.toLowerCase().includes(collaboratorSearch.toLowerCase()) &&
                                            !collaborators.includes(u.id.toString())
                                        )
                                        .map(u => (
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
                            </Box>
                        ) : (
                            <Flex gap="2" wrap="wrap">
                                {task.assignedUsers && task.assignedUsers.length > 0 ? (
                                    task.assignedUsers.map((user: User) => (
                                        <Badge key={user.id} variant="soft" size="2">
                                            {user.name} {user.surname}
                                        </Badge>
                                    ))
                                ) : (
                                    <Text size="2" color="gray">No collaborators assigned</Text>
                                )}
                            </Flex>)}
                    </Card>

                    {/* Comments Section */}
                    <Card size="3" mt="4">
                        <CommentSection taskId={task.id!} />
                    </Card>
                </Box>

                {/* Sidebar */}
                <Box style={{ width: "300px" }}>
                    <Card size="3">
                        <Flex direction="column" gap="4">
                            {/* Status */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Status
                                </Text>
                                {isEditing ? (
                                    <Select.Root
                                        value={editedTask.status}
                                        onValueChange={handleStatusChange}
                                    >
                                        <Select.Trigger />
                                        <Select.Content>
                                            <Select.Item value="NOT_STARTED">Not Started</Select.Item>
                                            <Select.Item value="IN_PROGRESS">In Progress</Select.Item>
                                            <Select.Item value="COMPLETED">Completed</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                ) : (
                                    <Badge color={getStatusColor(task.status)} size="2">
                                        {task.status.replace("_", " ")}
                                    </Badge>
                                )}
                            </Box>

                            {/* Priority */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Priority
                                </Text>
                                {isEditing ? (
                                    <Select.Root
                                        value={editedTask.priority}
                                        onValueChange={handlePriorityChange}
                                    >
                                        <Select.Trigger />
                                        <Select.Content>
                                            <Select.Item value="HIGH">High</Select.Item>
                                            <Select.Item value="MEDIUM">Medium</Select.Item>
                                            <Select.Item value="LOW">Low</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                ) : (
                                    <Badge color={getPriorityColor(task.priority)} size="2">
                                        {task.priority}
                                    </Badge>
                                )}
                            </Box>

                            {/* Deadline */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Deadline
                                </Text>
                                {isEditing ? (
                                    <CalendarDatePicker
                                        defaultValue={editedTask.deadline}
                                        onChange={handleDateChange}
                                    />
                                ) : (
                                    <Text size="3">
                                        {new Date(task.deadline).toLocaleDateString()}
                                    </Text>
                                )}
                            </Box>

                            {/* Creator */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Created by
                                </Text>
                                <Text size="3">
                                    {task.creator ? `${task.creator.name} ${task.creator.surname}` : "Unknown"}
                                </Text>
                            </Box>

                            {/* Created Date */}
                            <Box>
                                <Text as="div" size="2" mb="2" weight="bold">
                                    Created on
                                </Text>
                                <Text size="3">
                                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Unknown"}
                                </Text>
                            </Box>
                        </Flex>
                    </Card>
                </Box>
            </Flex>
        </Box>
    );
};