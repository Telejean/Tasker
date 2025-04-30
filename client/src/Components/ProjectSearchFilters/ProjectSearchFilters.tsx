import s from './ProjectSearchFilters.module.css'
import { LuChevronDown } from "react-icons/lu";
import { useAtom } from 'jotai';
import { projectFiltersAtom } from '@/Pages/Projects/Projects';
import { DropdownMenu } from '@radix-ui/themes';
import { projects } from '@/sampleData'
const accentColor = "#ef4872"


const ProjectSearchFilters = () => {
    const [filters, setFilters] = useAtom(projectFiltersAtom);

    // Get unique lists for dropdowns
    const allManagers = [...new Set(projects.map(p => p.manager))];
    const allMembers = [...new Set(projects.flatMap(p => p.members))];
    const statuses = ['active', 'archived'] as const;

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key]?.includes(value)
                ? prev[key]?.filter(v => v !== value)
                : [...(prev[key] || []), value]
        }));
    };

    return (
        <div className={s.projectsSearhFilterContainer}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <div className={s.projectsSearchFilter}>
                        <p>Owner</p>
                        <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
                    </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {allManagers.map(manager => (
                        <DropdownMenu.CheckboxItem
                            key={manager}
                            checked={filters.owner?.includes(manager)}
                            onCheckedChange={() => handleFilterChange('owner', manager)}
                        >
                            {manager}
                        </DropdownMenu.CheckboxItem>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <div className={s.projectsSearchFilter}>
                        <p>Members</p>
                        <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
                    </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {allMembers.map(member => (
                        <DropdownMenu.CheckboxItem
                            key={member}
                            checked={filters.members?.includes(member)}
                            onCheckedChange={() => handleFilterChange('members', member)}
                        >
                            {member}
                        </DropdownMenu.CheckboxItem>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <div className={s.projectsSearchFilter}>
                        <p>Status</p>
                        <LuChevronDown size={20} strokeWidth={3} color={accentColor} />
                    </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {statuses.map(status => (
                        <DropdownMenu.CheckboxItem
                            key={status}
                            checked={filters.status?.includes(status)}
                            onCheckedChange={() => handleFilterChange('status', status)}
                        >
                            {status}
                        </DropdownMenu.CheckboxItem>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div>
    );
};

export default ProjectSearchFilters
