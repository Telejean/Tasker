import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Task } from './Task.model';
import { Team } from './Team.model';

@Table
export class AssignedTeam extends Model {
    @ForeignKey(() => Task)
    @Column
    taskId!: number;

    @BelongsTo(() => Task)
    task!: Task;

    @ForeignKey(() => Team)
    @Column
    teamId!: number;

    @BelongsTo(() => Team)
    team!: Team;
}