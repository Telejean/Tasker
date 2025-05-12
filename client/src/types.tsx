import { DateValue } from "react-aria-components";

export interface Task {
    id: number;
    projectName: string;
    name: string;
    deadline: DateValue;
    description: string;
    assignedPeople: string[];
    status: 'completed' | 'in-progress' | 'not-started';
    priority: string;
}

export interface RangeValue<T> {
    start: T,
    end: T;
}

export interface TaskFilters {
    status?: string[];
    deadline?: RangeValue<DateValue>;
    projectName?: string;
    assignedPeople?: string[];
    priority?: string;
}

export interface SortOptions {
    field: keyof Task | null;
    direction: 'asc' | 'desc' | null;
}

export interface Project {
    id: number;
    name: string;
    teams: Team[];
    manager: User;
    managerId: number;
    completion: number;
    iconId: number;
    icon: string;
    status: 'active' | 'archived' | 'deleted';
    description?: string;
}

export interface Team {
    id: number;
    name: string;
    projectId: number;
    userTeams: UserTeam[];
}

export interface UserTeam {
    id: number;
    userId: number;
    teamId: number;
    userRole: string;
    user: User;
}

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    role?: string;
    isAdmin?: boolean;
    iconName?: string;
    iconBgColor?: string;
    tags?: any;
    bio?: string;
}