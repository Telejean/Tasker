import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User.model';
import { Project } from './Project.model';

@Table
export class UserProject extends Model {
    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Project)
    @Column
    projectId!: number;

    @BelongsTo(() => Project)
    project!: Project;


}