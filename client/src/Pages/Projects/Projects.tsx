import { LuSearch, LuChevronDown } from "react-icons/lu";
import s from './Projects.module.css'
import TableBig from "../../Components/Tables/TableBig/TableBig";
import { projects } from '../../sampleData'
import ProjectSearchFilters from "../../Components/ProjectSearchFilters/ProjectSearchFilters";



const accentColor = "#ef4872"

const Projects = () => {
  return (
    <div className={s.projectsContainer}>
      <h1 className={s.projectsTitle}>Projects</h1>

      <div className={s.projectsContent}>

        <div className={s.projectsSearchBar}>
          <LuSearch size={24} color={accentColor} />
          <input type="text" placeholder="Search for a project" className={s.projectsSearchBarInput} />
        </div>

        <ProjectSearchFilters />

        <TableBig data={projects} />

      </div>

    </div>
  )
}

export default Projects
