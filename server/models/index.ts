// Export all models from a single file to simplify imports
import { AssignedPerson } from './AssignedPerson';
import { PermissionLog } from './PermissionLog';
import { Policy } from './Policy';
import { Project } from './Project';
import { ProjectMember } from './ProjectMember';
import { ProjectPolicy } from './ProjectPolicy';
import { Rule } from './Rule';
import { Task } from './Task';
import { TaskPolicy } from './TaskPolicy';
import { User } from './User';
import { UserPolicy } from './UserPolicy';

// Export all models
export {
    AssignedPerson,
    PermissionLog,
    Policy,
    Project,
    ProjectMember,
    ProjectPolicy,
    Rule,
    Task,
    TaskPolicy,
    User,
    UserPolicy
};

// Export a complete array of models for Sequelize initialization
const models = [
    AssignedPerson,
    PermissionLog,
    Policy,
    Project,
    ProjectMember,
    ProjectPolicy,
    Rule,
    Task,
    TaskPolicy,
    User,
    UserPolicy
];

export default models;