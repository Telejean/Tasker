import HomeCard from '../../Components/HomeCard/HomeCard'
import TableSmall from "../../Components/Tables/TableSmall"
import { ProjectCard } from '../../Components/ProjectCard/ProjectCard';
import CreateProjectCard from '../../Components/ProjectCard/CreateProjectCard';
import { Grid, Box, Flex, ScrollArea, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { Project, Task } from '@/types';
import { parseDate } from '@internationalized/date';

const Home = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the user's tasks
        const tasksData = await taskService.getMyTasks();

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

        // Fetch the user's projects
        const projectsData = await projectService.getMyProjects();

        // Transform project data to match the UI format
        const formattedProjects = projectsData.map((project: any) => ({
          id: project.id,
          name: project.name,
          members: project.members?.map((member: any) => member.name) || [],
          manager: project.manager?.name || "Unknown",
          completion: project.completion || 0,
          iconId: project.iconId || 1,
          icon: "LuFile", // Default icon
          status: project.status?.toLowerCase() || "active",
          description: project.description || ""
        }));

        setProjects(formattedProjects);
        setError("");
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box p="6">
        <Text>Loading dashboard data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6">
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <Flex wrap='wrap' gap='8' p='4' justify='center'>
      <HomeCard title={"Tasks"}>
        <ScrollArea type="always" scrollbars="vertical" style={{ height: "40vh" }}>
          <TableSmall data={tasks} />
        </ScrollArea>
      </HomeCard>

      <HomeCard title={"Projects"}>
        <Grid rows='2' columns='2' gap='4' height="40vh">
          {
            projects.slice(0, 3).map((project, index) => (
              <ProjectCard
                key={index}
                iconName={project.icon}
                projectName={project.name}
                noTasks={tasks.filter(task => task.projectName === project.name).length}
              />
            ))
          }
          <CreateProjectCard />
        </Grid>
      </HomeCard>
    </Flex>
  );
};

export default Home;
