import { NavLink } from "react-router";
import { LuHouse, LuClipboardList, LuLayers } from "react-icons/lu";
import s from './Sidebar.module.css'

const Sidebar = () => {
    return (
        <div className={s.sidebarContainer}>
            <NavLink to="/home" className={"link"}>
                <div className={s.sidebarItem}>
                    <LuHouse size={24} />
                    <h2>Home</h2>
                </div>
            </NavLink>

            <NavLink to="/tasks" className={"link"}>
                <div className={s.sidebarItem}>
                    <LuClipboardList size={24} />
                    <h2>My Tasks</h2>
                </div>
            </NavLink>

            <NavLink to="/projects" className={"link"}>
                <div className={s.sidebarItem}>
                    <LuLayers size={24} />
                    <h2>Projects</h2>
                </div>
            </NavLink>
        </div>
    )
}

export default Sidebar
