import icon_1 from "../../Assets/proj_icon_1.png"
import icon_2 from "../../Assets/proj_icon_2.png"
import icon_3 from "../../Assets/proj_icon_3.png"
import s from "./ProjectCard.module.css"

const icons = [icon_1, icon_2, icon_3]

export const ProjectCard = ({ projectName, noTasks, id }) => {
    return (
        <div className={s.projectCardContainer}>
            <img src={icons[id]} alt="" />
            <div className={s.projectCardText}>
                <h4>{projectName}</h4>
                <p>{noTasks}</p>
            </div>

        </div>
    )
}
