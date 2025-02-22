import { LuBadgePlus } from "react-icons/lu";
import s from "./ProjectCard.module.css"
const CreateProjectCard = () => {
    return (
        <div className={s.projectCardContainer}>
            <LuBadgePlus size={64} color="#e0f1ff" />
            <div className={s.projectCardText}>
                <h4 className={s.projectCardProjName}>Create a new project</h4>

            </div>
        </div>
    )
}

export default CreateProjectCard
