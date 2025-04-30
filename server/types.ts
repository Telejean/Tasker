
export enum RuleEffect {
    ALLOW = 'ALLOW',
    DENY = 'DENY'
}

export enum UserRoles {
    MEMBER = 'MEMBER',
    LEADER = 'LEADER',
    COORDINATOR = 'COORDINATOR',
    BOARD = 'BOARD'
}

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

export enum TaskStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export interface Rule {
    id: number;
    name: string;
    description?: string;
    effect: RuleEffect;
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
    email: string;
    password: string;
    role: UserRoles;
    tasks: Task[];
    policies: UserPolicy[];
    permissionLogs: PermissionLog[];
    projects: Project[];
    managedProjects: Project[];
}

export interface Project {
    id: number;
    name: string;
    iconId: number;
    icon: string;
    status: ProjectStatus;
    tasks: Task[];
    managerId: number;
    manager: User;
    policies: ProjectPolicy[];
    users: User[];
}

export interface Task {
    id: number;
    name: string;
    description: string;
    deadline: DateValue;
    status: TaskStatus;
    priority: string;
    projectId: number;
    project: Project;
    assignedPeople: User[];
    policies: TaskPolicy[];
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

declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DATABASE_URL: string;
      CLIENT_URL: string;
      // Add other environment variables you use
    }
  }