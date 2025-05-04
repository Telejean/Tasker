import { Table, Column, Model, DataType, HasMany, BelongsTo, BelongsToMany, ForeignKey, HasOne } from 'sequelize-typescript';
import { AssignedPerson } from './AssignedPerson.model';
import { Project } from './Project.model';
import { Department } from './Department.model';
import { UserPolicy } from './UserPolicy.model';
import { PermissionLog } from './PermissionLog.model';
import { UserRoles } from '../types';
import { UserProject } from './UserProjects.model';
import { Task } from './Task.model';

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
        type: DataType.STRING,
        allowNull: true,
    })
    team!: string;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    tags!: JSON;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    bio!: string;

    @Column({
        type: DataType.ENUM(...Object.values(UserRoles) as string[]),
        allowNull: false,
    })
    role!: typeof UserRoles[keyof typeof UserRoles];

    @HasMany(() => AssignedPerson)
    tasks!: Task[];

    @HasMany(() => UserPolicy)
    policies!: UserPolicy[];

    @HasMany(() => PermissionLog)
    permissionLogs!: PermissionLog[];

    @BelongsToMany(() => Project, () => UserProject)
    projects!: Project[];

    @HasOne(() => Project)
    managedProjects!: Project[];

    @ForeignKey(() => Department)
    departmentId!: number;

    @BelongsTo(() => Department)
    department!: Department;
}