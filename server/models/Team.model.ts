import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { User } from './User.model';
import { Project } from './Project.model';
import { UserTeam } from './UserTeam.model';

@Table
export class Team extends Model {

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    name!: string;

    @ForeignKey(() => Project)
    @Column
    projectId!: number;

    @BelongsTo(() => Project)
    project!: Project;

    @BelongsToMany(() => User, () => UserTeam)
    users!: User[];

    @HasMany(() => UserTeam)
    userTeams!: UserTeam[];
}