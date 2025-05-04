import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Task } from './Task.model';
import { Policy } from './Policy.model';

@Table
export class TaskPolicy extends Model {
    @ForeignKey(() => Task)
    @Column
    taskId!: number;

    @BelongsTo(() => Task)
    task!: Task;

    @ForeignKey(() => Policy)
    @Column
    policyId!: number;

    @BelongsTo(() => Policy)
    policy!: Policy;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    assignedAt!: Date;
}