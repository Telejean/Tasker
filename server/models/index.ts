// Export all models from a single file to simplify imports
import { AssignedPerson } from './AssignedPerson.model';
import { Department } from './Department.model';
import { PermissionLog } from './PermissionLog.model';
import { Policy } from './Policy.model';
import { Project } from './Project.model';
import { ProjectMember } from './ProjectMember.model';
import { ProjectPolicy } from './ProjectPolicy.model';
import { Rule } from './Rule.model';
import { Task } from './Task.model';
import { TaskPolicy } from './TaskPolicy.model';
import { User } from './User.model';
import { UserPolicy } from './UserPolicy.model';
import { UserProject } from './UserProjects.model';
// Export all models
export {
    AssignedPerson,
    Department,
    PermissionLog,
    Policy,
    Project,
    ProjectMember,
    ProjectPolicy,
    Rule,
    Task,
    TaskPolicy,
    User,
    UserPolicy,
    UserProject
};

// Export a complete array of models for Sequelize initialization
const models = [
    AssignedPerson,
    Department,
    PermissionLog,
    Policy,
    Project,
    ProjectMember,
    ProjectPolicy,
    Rule,
    Task,
    TaskPolicy,
    User,
    UserPolicy,
    UserProject
];

export default models;