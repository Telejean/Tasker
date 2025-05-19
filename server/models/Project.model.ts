import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { Task } from './Task.model';
import { User } from './User.model';
import { ProjectPolicy } from './ProjectPolicy.model';
import { Team } from './Team.model';
import { UserProject } from './UserProjects.model';
import { UserPolicy } from './UserPolicy.model';

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
        type: DataType.TEXT,
        allowNull: true,
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "ACTIVE",
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

    @BelongsToMany(() => User, () => UserProject)
    members!: User[];

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    endDate!: Date;


}