export const RuleEffect = {
    ALLOW: 'ALLOW',
    DENY: 'DENY'
};

export const UserRoles = {
    MEMBER: 'MEMBER',
    LEADER: 'LEADER',
    COORDINATOR: 'COORDINATOR',
    BOARD: 'BOARD'
};

export const ProjectStatus = {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    DELETED: 'DELETED'
};

export const TaskStatus = {
    NOT_STARTED: 'NOT_STARTED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
};

export interface Rule {
    id: number;
    name: string;
    description?: string;
    effect: typeof RuleEffect[keyof typeof RuleEffect];
    subjectAttributes?: Record<string, any>;
    resourceAttributes?: Record<string, any>;
    actionAttributes?: Record<string, any>;
    environmentAttributes?: Record<string, any>;
    condition?: string;
    priority: number;
    policyId: number;
    policy: Policy;
}

export interface UserPolicy {
    id: number;
    userId: number;
    policyId: number;
    assignedAt: Date;
    expiresAt?: Date;
    user: User;
    policy: Policy;
}

export interface ProjectPolicy {
    id: number;
    projectId: number;
    policyId: number;
    assignedAt: Date;
    project: Project;
    policy: Policy;
}

export interface TaskPolicy {
    id: number;
    taskId: number;
    policyId: number;
    assignedAt: Date;
    task: Task;
    policy: Policy;
}

export interface PermissionLog {
    id: number;
    userId: number;
    action: string;
    resource: string;
    allowed: boolean;
    reason?: string;
    timestamp: Date;
    user: User;
}

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    tags: JSON;
    bio: string
    role: typeof UserRoles[keyof typeof UserRoles];
    tasks: Task[];
    policies: UserPolicy[];
    permissionLogs: PermissionLog[];
    projects: Project[];
    managedProjects: Project[];
    department: Department;
}

export interface Project {
    id: number;
    name: string;
    iconId: number;
    icon: string;
    status: typeof ProjectStatus[keyof typeof ProjectStatus];
    tasks: Task[];
    managerId: number;
    manager: User;
    policies: ProjectPolicy[];
    users: User[];
}

export interface Task {
    id: number;
    name: string;
    creatorId: number;
    description: string;
    deadline: string;
    status: typeof TaskStatus[keyof typeof TaskStatus];
    priority: string;
    projectId: number;
    project?: Project;
    assignedPeople?: User[];
    assignedPeopleIds?: number[];
    policies?: TaskPolicy[];
}

export interface Policy {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    rules: Rule[];
    userAssignments: UserPolicy[];
    projectAssignments: ProjectPolicy[];
    taskAssignments: TaskPolicy[];
}

export interface Department{
    name: string;
}

declare namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        DATABASE_URL: string;
        CLIENT_URL: string;
        // Add other environment variables you use
    }
}

module.exports = {
    RuleEffect,
    UserRoles,
    ProjectStatus,
    TaskStatus
};