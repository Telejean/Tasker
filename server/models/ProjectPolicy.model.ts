import { Table, ForeignKey, Model, DataType, BelongsTo, Column } from 'sequelize-typescript';
import { Project } from './Project.model';
import { Policy } from './Policy.model';

@Table
export class ProjectPolicy extends Model {
    @ForeignKey(() => Project)
    @Column
    projectId!: number;

    @BelongsTo(() => Project)
    project!: Project;

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