import { Box, Flex, Heading, Tabs } from "@radix-ui/themes"
import { useParams } from "react-router-dom"
import { projects, sampleTasks } from "@/sampleData"
import TasksTable from "@/Components/Tables/TasksTable"
import { Task } from "@/types"
import ProjectMembersTable from "@/Components/Tables/ProjectMembersTable"
import Kanban from "@/Components/Kanban/Kanban"

const ProjectPage = () => {
    const { id } = useParams()
    const project = projects.find(p => p.id === Number(id))
    const projectTasks = sampleTasks.filter(task => task.projectName === project?.name)

    if (!project) {
        return <div>Project not found</div>
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
                    </Tabs.List>

                    <Tabs.Content value="overview">
                        <Flex direction="column" gap="4">
                            <Box>
                                <Heading as="h3" mb="2">Tasks</Heading>
                                <TasksTable data={projectTasks} />
                            </Box>

                            <Box>
                                <Heading as="h3" mb="2">Team Members</Heading>
                                <ProjectMembersTable
                                    members={project.members}
                                    manager={project.manager}
                                />
                            </Box>
                        </Flex>
                    </Tabs.Content>

                    <Tabs.Content value="board">
                        <Kanban tasks={projectTasks} />
                    </Tabs.Content>

                    <Tabs.Content value="calendar">
                        Calendar View (Coming Soon)
                    </Tabs.Content>

                    <Tabs.Content value="files">
                        Files View (Coming Soon)
                    </Tabs.Content>
                </Flex>
            </Tabs.Root>
        </Box>
    )
}

export default ProjectPage