import { useState, useEffect } from "react";
import { Box, Flex, Heading, Tabs, Text, Button, Card, Dialog } from "@radix-ui/themes";
import { useParams } from "react-router-dom";
import TasksTable from "@/Components/Tables/TasksTable";
import { Project, Task, User } from "@my-types/types";
import TeamList from "@/Components/Tables/TeamList";
import Kanban from "@/Components/Kanban/Kanban";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import Permission from "@/Components/Permission/Permission";
import PolicyAssignment from "@/Components/Permission/PolicyAssignment";
import { parseDate } from "@internationalized/date";
import { userAtom } from "../../App";
import { useAtom } from "jotai";
import { LuPencil } from "react-icons/lu";
import ProjectModal from "../../Components/ProjectCard/ProjectModal";
import { userService } from "@/services/user.service";
import { TasksAdd } from "@/Components/TasksAdd/TasksAdd";
import ProjectMembersTable from "@/Components/Tables/ProjectMembersTable";

const ProjectPage = () => {
    console.log("ProjectPage component rendered");
    
    const { id } = useParams();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); const [user] = useAtom(userAtom);
    const [projectModalOpen, setProjectModalOpen] = useState(false);

    const isAdmin = user?.isAdmin || false;

    const refreshProjectData = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const projectData = await projectService.getProjectById(parseInt(id));
            console.log("Project data:", projectData);
    
            setProject(projectData);
        } catch (err) {
            console.error("Error refreshing project data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (newTaskData: any) => {
        if (!project) return;
        try {
            const createdTask = await taskService.createTask({
                ...newTaskData,
                projectId: project.id
            });
           
            setTasks(createdTasks => [...tasks, createdTask]);
            setProjectModalOpen(false);
        } catch (err) {
            console.error("Error creating task:", err);
        }
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);

                if (!id) {
                    setError("Invalid project ID");
                    return;
                }

                const projectData = await projectService.getProjectById(parseInt(id));

                // const formattedProject = {
                //     id: projectData.id,
                //     name: projectData.name,
                //     teams: projectData.teams || [],
                //     manager: projectData.manager || { id: 0, name: "Unknown" },
                //     managerId: projectData.managerId,
                //     completion: projectData.completion || 0,
                //     iconId: projectData.iconId || 1,
                //     icon: projectData.icon || "LuFile",
                //     status: projectData.status?.toLowerCase() || "active",
                //     description: projectData.description || ""
                // };

                setProject(projectData);

                const usersData = await userService.getUsersFromProject(parseInt(id));
                setAllUsers(usersData);

                const tasksData = await taskService.getTasksByProject(parseInt(id));
                console.log("Tasks data:", tasksData);
                setTasks(tasksData);
                
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
            <Flex justify="between" align="baseline" mb="4">
                <Heading as="h1">{project.name}</Heading>
                {isAdmin && (
                    <Button
                        variant="soft"
                        color="indigo"
                        onClick={() => setProjectModalOpen(true)}
                    >
                        <LuPencil />
                        Edit Project
                    </Button>
                )}
            </Flex>

            {projectModalOpen && (
                <ProjectModal
                    open={projectModalOpen}
                    onOpenChange={setProjectModalOpen}
                    projectId={project.id}
                    onProjectSaved={refreshProjectData}
                />
            )}

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
                                    <Permission action="create" resourceType="task" resourceId={project.id}>
                                        <TasksAdd onAddTask={handleAddTask} projectId={project.id} />
                                    </Permission>
                                </Flex>

                                <TasksTable data={tasks} />

                            </Box>

                            <Box>
                                <Flex justify="between" align="center" mb="2">
                                    <Heading as="h3">Team Members</Heading>
                                </Flex>
                                <TeamList
                                    projectId={project.id}
                                    availableUsers={allUsers}
                                    projectManager={project.manager}
                                />
                            </Box>
                            <Box>
                                <Flex justify="between" align="center" mb="2">
                                    <Heading as="h3">Project Members</Heading>
                                </Flex>
                                    <ProjectMembersTable data={{ members: project.members, manager: project.manager }} />
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

            <ProjectModal
                open={projectModalOpen}
                onOpenChange={setProjectModalOpen}
                projectId={project.id}
                onProjectSaved={async () => {
                    try {
                        setLoading(true);
                        const updatedProject = await projectService.getProjectById(project.id);

                        setProject({
                            ...updatedProject,
                            id: updatedProject.id,
                            name: updatedProject.name,
                            teams: updatedProject.teams || [],
                            manager: updatedProject.manager || { id: 0, name: "Unknown" },
                            managerId: updatedProject.managerId,
                            completion: updatedProject.completion || 0,
                            iconId: updatedProject.iconId || 1,
                            icon: updatedProject.icon || "LuFile",
                            status: updatedProject.status?.toLowerCase() || "active",
                            description: updatedProject.description || ""
                        });
                    } catch (err) {
                        console.error("Error refreshing project data:", err);
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </Box>
    );
};

export default ProjectPage;