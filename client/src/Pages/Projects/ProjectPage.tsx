import { useState, useEffect } from "react";
import { Box, Flex, Heading, Tabs, Text, Button, Card, Dialog } from "@radix-ui/themes";
import { useParams } from "react-router-dom";
import TasksTable from "@/Components/Tables/TasksTable";
import { Project, Task, User } from "@/types";
import TeamList from "@/Components/Tables/TeamList";
import Kanban from "@/Components/Kanban/Kanban";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import Permission from "@/Components/Permission/Permission";
import PolicyAssignment from "@/Components/Permission/PolicyAssignment";
import { parseDate } from "@internationalized/date";

const ProjectPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);

                if (!id) {
                    setError("Invalid project ID");
                    return;
                }

                // Fetch project details
                const projectData = await projectService.getProjectById(parseInt(id));

                // Transform project data to match the UI format
                const formattedProject = {
                    id: projectData.id,
                    name: projectData.name,
                    teams: projectData.teams || [],
                    manager: projectData.manager || { id: 0, name: "Unknown" },
                    managerId: projectData.managerId,
                    completion: projectData.completion || 0,
                    iconId: projectData.iconId || 1,
                    icon: projectData.icon || "LuFile", // Default icon
                    status: projectData.status?.toLowerCase() || "active",
                    description: projectData.description || ""
                };

                setProject(formattedProject);

                // Fetch all users for team management
                const usersResponse = await fetch('/api/users');
                const usersData = await usersResponse.json();
                setAllUsers(usersData);

                // Fetch project tasks
                const tasksData = await taskService.getTasksByProject(parseInt(id));

                // Transform the task data to match the expected format
                const formattedTasks = tasksData.map((task: any) => ({
                    id: task.id,
                    projectName: task.project?.name || "No Project",
                    name: task.name,
                    deadline: task.deadline ? parseDate(new Date(task.deadline).toISOString().split('T')[0]) : null,
                    description: task.description || "",
                    assignedPeople: task.assignedPeople?.map((person: any) => person.user?.name || "Unknown") || [],
                    status: task.status?.toLowerCase() || "not-started",
                    priority: task.priority || "medium"
                }));

                setTasks(formattedTasks);

            } catch (err) {
                console.error("Error fetching project data:", err);
                setError("Failed to load project data");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id]);

    if (loading) {
        return <Box p="6"><Text>Loading project details...</Text></Box>;
    }

    if (error || !project) {
        return (
            <Box p="6">
                <Card>
                    <Text color="red">{error || "Project not found"}</Text>
                </Card>
            </Box>
        );
    }

    return (
        <Box width="100%" p="4">
            <Heading as="h1" align="center" mb="4">{project.name}</Heading>

            <Tabs.Root defaultValue="overview">
                <Flex direction="column" gap="2">
                    <Tabs.List>
                        <Tabs.Trigger value="overview">
                            <Heading as="h2">Overview</Heading>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="board">
                            <Heading as="h2">Board</Heading>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="calendar">
                            <Heading as="h2">Calendar</Heading>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="files">
                            <Heading as="h2">Files</Heading>
                        </Tabs.Trigger>

                        {/* Settings tab only visible to project managers and admins */}
                        <Permission action="manage" resourceType="project" resourceId={project.id}>
                            <Tabs.Trigger value="settings">
                                <Heading as="h2">Settings</Heading>
                            </Tabs.Trigger>
                        </Permission>
                    </Tabs.List>

                    <Tabs.Content value="overview">
                        <Flex direction="column" gap="4">
                            <Box>
                                <Flex justify="between" align="center" mb="2">
                                    <Heading as="h3">Tasks</Heading>

                                    {/* Add task button - only for those with create task permission */}
                                    <Permission action="create" resourceType="task" resourceId={project.id}>
                                        <Button size="2">Add Task</Button>
                                    </Permission>
                                </Flex>
                                <TasksTable data={tasks} />
                            </Box>                            <Box>
                                <Flex justify="between" align="center" mb="2">
                                    <Heading as="h3">Team Members</Heading>
                                </Flex>
                                <TeamList
                                    projectId={project.id}
                                    availableUsers={allUsers}
                                    projectManager={project.manager}
                                />
                            </Box>
                        </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="board">
                        <Kanban tasks={tasks} />
                    </Tabs.Content>

                    <Tabs.Content value="calendar">
                        Calendar View (Coming Soon)
                    </Tabs.Content>

                    <Tabs.Content value="files">
                        Files View (Coming Soon)
                    </Tabs.Content>

                    {/* Settings tab content */}
                    <Tabs.Content value="settings">
                        <Flex direction="column" gap="6">
                            <Box>
                                <Heading as="h3" mb="4">Project Settings</Heading>

                                <Card>
                                    <Flex direction="column" gap="3" p="3">
                                        <Box>
                                            <Text weight="bold">Project Status</Text>
                                            <Text>{project.status}</Text>
                                        </Box>

                                        <Box>
                                            <Text weight="bold">Description</Text>
                                            <Text>{project.description || "No description provided"}</Text>
                                        </Box>

                                        <Flex gap="2">
                                            <Permission action="update" resourceType="project" resourceId={project.id}>
                                                <Button variant="soft">Edit Project</Button>
                                            </Permission>

                                            <Permission action="delete" resourceType="project" resourceId={project.id}>
                                                <Button variant="soft" color="red">
                                                    Archive Project
                                                </Button>
                                            </Permission>
                                        </Flex>
                                    </Flex>
                                </Card>
                            </Box>

                            {/* Policy assignments section - only for administrators */}
                            <Permission action="manage" resourceType="policy">
                                <Box>
                                    <Heading as="h3" mb="4">Policy Assignments</Heading>
                                    <PolicyAssignment
                                        resourceType="project"
                                        resourceId={project.id}
                                        resourceName={project.name}
                                    />
                                </Box>
                            </Permission>
                        </Flex>
                    </Tabs.Content>
                </Flex>
            </Tabs.Root>
        </Box>
    );
};

export default ProjectPage;