import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';
import { Project } from './Project.model';

@Table
export class ProjectMember extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId!: number;

    @ForeignKey(() => Project)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    projectId!: number;

    @BelongsTo(() => User, 'userId')
    user!: User;

    @BelongsTo(() => Project, 'projectId')
    project!: Project;
}