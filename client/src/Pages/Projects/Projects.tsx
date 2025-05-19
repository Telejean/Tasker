import { LuSearch, LuPlus } from "react-icons/lu";
import s from './Projects.module.css'
import ProjectsTable from '@/Components/Tables/ProjectsTable'
import ProjectSearchFilters from '@/Components/ProjectSearchFilters/ProjectSearchFilters'
import { atom, useAtom } from 'jotai';
import { Project, ProjectFilters } from '@my-types/types';
import { useState, useEffect } from "react";
import { projectService } from '@/services/project.service';
import { Box, Text, Button } from '@radix-ui/themes';
import { userAtom } from '../../App';
import ProjectModal from '../../Components/ProjectCard/ProjectModal';

const accentColor = "#ef4872"

export const projectsAtom = atom<Project[]>([]);
export const projectFiltersAtom = atom<ProjectFilters>({});

const filteredProjectsAtom = atom((get) => {
    const allProjects = get(projectsAtom);
    const filters = get(projectFiltersAtom);

    if (Object.keys(filters).length === 0) {
        return allProjects;
    }

    return allProjects.filter((project: Project) => {
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [, setProjects] = useAtom(projectsAtom);
    const [user] = useAtom(userAtom);
    const [projectModalOpen, setProjectModalOpen] = useState(false);

    const isAdmin = user?.isAdmin || false; 
    
    useEffect(() => {
        const fetchProjects = async () => {
            const projects = await projectService.getMyProjects();
            setProjects(projects);
        }

        fetchProjects()
            .then(() => setLoading(false))
            .catch((err) => {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects");
                setLoading(false);
            });
    }, [setProjects]);

    const displayedProjects = filteredProjects.filter((project: Project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box p="6">
                <Text>Loading projects...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p="6">
                <Text color="red">{error}</Text>
            </Box>
        );
    } 
    return (
        <div className={s.projectsContainer}>
            <div className={s.projectsHeader}>
                <h1 className={s.projectsTitle}>Projects</h1>
                {isAdmin && (
                    <Button
                        color="indigo"
                        onClick={() => setProjectModalOpen(true)}
                    >
                        <LuPlus />
                        Create Project
                    </Button>
                )}
            </div>

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

            <ProjectModal
                open={projectModalOpen}
                onOpenChange={setProjectModalOpen}
                onProjectSaved={() => {
                    // Refresh the projects list after creating/updating a project
                    const fetchProjects = async () => {
                        try {
                            const projectsData = await projectService.getMyProjects();
                            const formattedProjects = projectsData.map((project: any) => ({
                                id: project.id,
                                name: project.name,
                                members: project.teams?.flatMap((team: any) =>
                                    team.users?.map((user: any) => user.name) || []
                                ) || [],
                                manager: project.manager?.name || "Unknown",
                                completion: project.completion || 0,
                                iconId: project.iconId || 1,
                                icon: "LuFile", // Default icon
                                status: project.status?.toLowerCase() || "active"
                            }));
                            setProjects(formattedProjects);
                        } catch (err) {
                            console.error("Error fetching projects:", err);
                        }
                    };
                    fetchProjects();
                }}
            />
        </div>
    );
};

export default Projects
