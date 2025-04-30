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
    members: string[];
    manager: string;
    completion: number;
    iconId: number;
    icon: string;
    status: 'active' | 'archived' | 'deleted';
}
export interface ProjectFilters {
    owner?: string[];
    members?: string[];
    status?: ('active' | 'archived' | 'deleted')[];
}