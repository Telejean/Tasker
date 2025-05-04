import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Task } from './Task.model';
import { User } from './User.model';

@Table
export class AssignedPerson extends Model {
    @ForeignKey(() => Task)
    @Column
    taskId!: number;

    @BelongsTo(() => Task)
    task!: Task;

    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;
}