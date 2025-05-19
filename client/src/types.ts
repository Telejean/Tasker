// import { DateValue } from "react-aria-components";

// export interface Task {
//     id?: number;
//     name: string;
//     deadline: string;
//     description: string;
//     creatorId: number;
//     assignedPeople: string[];
//     status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
//     priority: string;
//     projectId?: number;
//     project?: Project;
//     projectName?: string;
// }

// export interface RangeValue<T> {
//     start: T,
//     end: T;
// }

// export interface TaskFilters {
//     status?: string[];
//     deadline?: RangeValue<DateValue>;
//     projectName?: string;
//     assignedPeople?: string[];
//     priority?: string;
// }

// export interface SortOptions {
//     field: keyof Task | null;
//     direction: 'asc' | 'desc' | null;
// }

// export interface Project {
//     id: number;
//     name: string;
//     teams: Team[];
//     members: User[];
//     manager: User;
//     managerId: number;
//     completion: number;
//     iconId: number;
//     icon: string;
//     status: 'active' | 'archived' | 'deleted';
//     description?: string;
// }

// export interface Team {
//     id: number;
//     name: string;
//     projectId: number;
//     userTeams?: UserTeam[];
//     users?: User[];
// }

// export interface UserTeam {
//     id: number;
//     userId: number;
//     teamId: number;
//     userRole: string;
//     user: User;
// }

// export interface User {
//     id: number;
//     name: string;
//     surname: string;
//     email: string;
//     phoneNumber: string;
//     role?: string;
//     isAdmin?: boolean;
//     iconName?: string;
//     iconBgColor?: string;
//     tags: JSON;
//     bio: string;
//     department?: Department;
// }


// export interface Department {
//     id: number;
//     departmentName: string;
// }