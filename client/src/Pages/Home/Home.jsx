import HomeCard from '../../Components/HomeCard/HomeCard'
import s from './Home.module.css'
import {tasks, projects} from '../../sampleData'
import {LuCirclePlus} from "react-icons/lu";
import TableSmall from "../../Components/Tables/TableSmall/TableSmall.jsx";
import { ProjectCard } from '../../Components/ProjectCard/ProjectCard.jsx';
import CreateProjectCard from '../../Components/ProjectCard/CreateProjectCard.jsx';

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
    <div className={s.homeContainer}>

      <h3>{getCurrentDate()}</h3>
      <h2>Good evening, Rareș</h2>
      <div className={s.homecardsContainer}>
        <HomeCard title={"Tasks"}>
          <TableSmall data={tasks} columnsName={columnsSelector}></TableSmall>
        </HomeCard>
        <HomeCard title={"Projects"}>
          <div className={s.projectCardsContainer}>
          <CreateProjectCard/>
          {projects.map((project, index) => {
            return <ProjectCard key={index} id={index} projectName={project.name} noTasks={4}></ProjectCard>
          })}
          </div>

        </HomeCard>
        <HomeCard title={"People"}></HomeCard>
        <HomeCard>
          <LuCirclePlus size={120} color={"#ffffff"}/>
        </HomeCard>
      </div>

    </div>
  )
}

export default Home
