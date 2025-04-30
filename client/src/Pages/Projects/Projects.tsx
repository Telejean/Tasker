import { LuSearch, LuChevronDown } from "react-icons/lu";
import s from './Projects.module.css'
import ProjectsTable from '@/Components/Tables/ProjectsTable'
import { projects } from '@/sampleData'
import ProjectSearchFilters from '@/Components/ProjectSearchFilters/ProjectSearchFilters'
import { atom, useAtom } from 'jotai';
import { ProjectFilters } from '@/types';
import { useState } from "react";

const accentColor = "#ef4872"

export const projectsAtom = atom(projects);
export const projectFiltersAtom = atom<ProjectFilters>({});

const filteredProjectsAtom = atom((get) => {
    const allProjects = get(projectsAtom);
    const filters = get(projectFiltersAtom);

    if (Object.keys(filters).length === 0) {
        return allProjects;
    }

    return allProjects.filter(project => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value.length === 0) return true;

            switch (key) {
                case 'owner':
                    return value.includes(project.manager);
                case 'members':
                    return value.some((member: string) => project.members.includes(member));
                case 'status':
                    return value.includes(project.status);
                default:
                    return true;
            }
        });
    });
});



const Projects = () => {
  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [searchQuery, setSearchQuery] = useState("");

  const displayedProjects = filteredProjects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className={s.projectsContainer}>
          <h1 className={s.projectsTitle}>Projects</h1>

          <div className={s.projectsContent}>
              <div className={s.projectsSearchBar}>
                  <LuSearch size={24} color={accentColor} />
                  <input 
                      type="text" 
                      placeholder="Search for a project" 
                      className={s.projectsSearchBarInput}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>

              <ProjectSearchFilters />
              <ProjectsTable data={displayedProjects} />
          </div>
      </div>
  );
};

export default Projects
