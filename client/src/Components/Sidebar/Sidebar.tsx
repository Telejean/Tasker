import { NavLink } from "react-router";
import { LuHouse, LuClipboardList, LuLayers, LuShieldCheck } from "react-icons/lu";
import s from './Sidebar.module.css';
import Permission from "../Permission/Permission";
import { Box, Separator, Text } from "@radix-ui/themes";

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

            <Permission action="manage" resourceType="policy">
                <>
                    <Separator my="3" size="4" />
                    <Box px="3" py="2">
                        <Text size="2" weight="bold" color="gray">Admin</Text>
                    </Box>

                    <NavLink to="/admin/policies" className={"link"}>
                        <div className={s.sidebarItem}>
                            <LuShieldCheck size={24} />
                            <h2>Policies</h2>
                        </div>
                    </NavLink>
                </>
            </Permission>
        </div>
    )
}

export default Sidebar
