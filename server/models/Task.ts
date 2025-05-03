import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Project } from './Project';
import { AssignedPerson } from './AssignedPerson';

@Table
export class Task extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    deadline?: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'NOT_STARTED',
    })
    status!: string;

    @ForeignKey(() => Project)
    @Column
    projectId!: number;

    @BelongsTo(() => Project)
    project!: Project;

    @HasMany(() => AssignedPerson)
    assignedPeople!: AssignedPerson[];
}
