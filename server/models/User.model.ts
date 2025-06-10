import { Table, Column, Model, DataType, HasMany, BelongsTo, BelongsToMany, ForeignKey, HasOne, AllowNull } from 'sequelize-typescript';
import { AssignedPerson } from './AssignedPerson.model';
import { Project } from './Project.model';
import { Department } from './Department.model';
import { UserPolicy } from './UserPolicy.model';
import { PermissionLog } from './PermissionLog.model';
import { UserTeam } from './UserTeam.model';
import { Task } from './Task.model';
import { Team } from './Team.model';
import { UserProject } from './UserProjects.model';
import { Comment } from './Comment.model';
import { CommentLike } from './CommentLike.model';
import { PerformanceStats, UserAvailability, UserSkills } from '@my-types/types';

@Table
export class User extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    surname!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    phoneNumber!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    bio!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    isAdmin!: boolean

    @HasMany(() => AssignedPerson)
    tasks!: Task[];

    @HasMany(() => UserPolicy)
    policies!: UserPolicy[]; @HasMany(() => PermissionLog)
    permissionLogs!: PermissionLog[];

    @HasMany(() => Comment)
    comments!: Comment[];

    @HasMany(() => CommentLike)
    commentLikes!: CommentLike[];

    @BelongsToMany(() => Team, () => UserTeam)
    teams!: Team[];

    @HasOne(() => Project, 'managerId')
    managedProjects!: Project[];

    @ForeignKey(() => Department)
    departmentId!: number;

    @BelongsTo(() => Department)
    department!: Department;

    @BelongsToMany(() => Project, () => UserProject)
    projects!: Project[];

    //AI

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    tags!: JSON;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    workload!: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    performanceStats!: PerformanceStats;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    skills!: UserSkills;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    availability!: UserAvailability;
}