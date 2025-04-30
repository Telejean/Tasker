import HomeCard from '../../Components/HomeCard/HomeCard'
import { sampleTasks, projects } from '../../sampleData'
import { LuCirclePlus } from "react-icons/lu";
import TableSmall from "../../Components/Tables/TableSmall"
import { ProjectCard } from '../../Components/ProjectCard/ProjectCard';
import CreateProjectCard from '../../Components/ProjectCard/CreateProjectCard';
import { Grid, Box, Card, Flex, Section, ScrollArea } from '@radix-ui/themes';

const columnsSelector = [{
  accesor: "name",
  displayName: "Task Name"
}, {
  accesor: "projectName",
  displayName: "Project Name"
}, {
  accesor: "deadline",
  displayName: "Deadline"
}]

const Home = () => {
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).toLowerCase();
  };

  return (
    <Flex wrap='wrap' gap='8' p='4' justify='center'>
      <HomeCard title={"Tasks"}>
        <ScrollArea type="always" scrollbars="vertical" style={{ height: "40vh" }}>
          <TableSmall data={sampleTasks}  />
        </ScrollArea>
      </HomeCard>

      <HomeCard title={"Projects"}>
        <Grid rows='2' columns='2' gap='4' height="40vh">
          {
            projects.map((project, index) => (
              <ProjectCard key={index} iconName={project.icon} projectName={project.name} noTasks={4}></ProjectCard>
            ))
          }
          <CreateProjectCard />
        </Grid>
      </HomeCard>

      <HomeCard title={"People"}>

      </HomeCard>

      <HomeCard title='Calendar'>

      </HomeCard>

    </Flex>
  )
}

export default Home
