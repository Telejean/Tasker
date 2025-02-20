import s from './Sidebar.module.css'
import { LuHouse, LuClipboardList, LuLayers } from "react-icons/lu";

const Sidebar = () => {
    return (
        <div className={s.sidebarContainer}>
            <div className={s.sidebarItem}>
                <LuHouse size={24} />
                <h2>Home</h2>
            </div>
            <div className={s.sidebarItem}>
                <LuClipboardList size={24} />
                <h2>My Tasks</h2>
            </div>
            <div className={s.sidebarItem}>
                <LuLayers size={24} />
                <h2>Projects</h2>
            </div>
        </div>
    )
}

export default Sidebar
