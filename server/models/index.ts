// Export all models from a single file to simplify imports
import { AssignedPerson } from './AssignedPerson.model';
import { Department } from './Department.model';
import { PermissionLog } from './PermissionLog.model';
import { Policy } from './Policy.model';
import { Project } from './Project.model';
import { ProjectPolicy } from './ProjectPolicy.model';
import { Rule } from './Rule.model';
import { Task } from './Task.model';
import { TaskPolicy } from './TaskPolicy.model';
import { User } from './User.model';
import { UserPolicy } from './UserPolicy.model';
import { UserTeam } from './UserTeam.model';
import { Team } from './Team.model';
import { UserProject } from './UserProjects.model';
import { Comment } from './Comment.model';
import { CommentLike } from './CommentLike.model';
export {
    AssignedPerson,
    Department,
    PermissionLog,
    Policy,
    Project,
    ProjectPolicy,
    Rule,
    UserProject,
    Task,
    TaskPolicy,
    User,
    UserPolicy,
    UserTeam,
    Team,
    Comment,
    CommentLike
};

const models = [
    AssignedPerson,
    Department,
    PermissionLog,
    Policy,
    Project,
    UserProject,
    ProjectPolicy,
    Rule,
    Task,
    TaskPolicy,
    User,
    UserPolicy,
    UserTeam,
    Team,
    Comment,
    CommentLike
];

export default models;