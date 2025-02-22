import React from 'react'
import s from './ProjectSearchFilters.module.css'
import { LuChevronDown } from "react-icons/lu";
const accentColor = "#ef4872"

const ProjectSearchFilters = () => {
  return (
    <>
    <div className={s.projectsSearhFilterContainer}>
    <div className={s.projectsSearchFilter}>
      <p>Owner</p>
      <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
    </div>
    <div className={s.projectsSearchFilter}>
      <p>
        Members
      </p>
      <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
    </div>
    <div className={s.projectsSearchFilter}>
      <p>
        Status
      </p>
      <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
    </div>
  </div>
    </>
    
  )
}

export default ProjectSearchFilters
