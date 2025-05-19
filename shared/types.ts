//COMMON

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    role?: string;
    isAdmin: boolean;
    tags: JSON;
    bio: string;
    department?: Department;
}

export interface Department {
    id: number;
    departmentName: string;
}

export interface Project {
    id: number;
    name: string;
    iconId: number;
    icon: string;
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
    manager: User;
    managerId: number;
    members: User[];
    teams: Team[];
    completion: number; //IMPLEMENT IN BACKEND
    description?: string;
}

export interface Task {
    id?: number;
    name: string;
    description: string;
    status: string;
    priority: string;
    projectId: number;
    project: Project;
    deadline: Date;
    creatorId: number;
    assignedUsers: User[];
}

export interface Team {
    id: number;
    name: string;
    projectId: number;
    users?: User[];
}

//FRONT

export interface RangeValue<T> {
    start: T,
    end: T;
}

export interface TaskFilters {
    status?: string[];
    deadline?: RangeValue<Date>;
    project?: Project;
    assignedUsers?: User[];
    priority?: string;
}

export interface SortOptions {
    field: keyof Task | null;
    direction: 'asc' | 'desc' | null;
}

export interface PerformanceStats {
    tasksCompleted: number;
    overdueTasks: number;
    avgCompletionTime: number;
}

export interface UserSkills {
    technical: string[];
    soft: string[];
    certifications: string[];
}

export interface UserAvailability {
    monday: [number, number];
    tuesday: [number, number];
    wednesday: [number, number];
    thursday: [number, number];
    friday: [number, number];
    saturday: [number, number];
    sunday: [number, number];
}