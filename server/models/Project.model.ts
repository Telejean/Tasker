import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { Task } from './Task.model';
import { User } from './User.model';
import { ProjectStatus } from '../types';
import { ProjectPolicy } from './ProjectPolicy.model';
import { Team } from './Team.model';

@Table
export class Project extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    iconId!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    icon!: string;

    @Column({
        type: DataType.ENUM(...Object.values(ProjectStatus)),
        allowNull: false,
        defaultValue: ProjectStatus.ACTIVE,
    })
    status!: string;

    @HasMany(() => Task)
    tasks!: Task[];

    @HasMany(() => Team)
    teams!: Team[];

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    managerId!: number;

    @BelongsTo(() => User, 'managerId')
    manager!: User;

    @HasMany(() => ProjectPolicy)
    policies!: ProjectPolicy[];
}