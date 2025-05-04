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
    policyId!: number;

    @BelongsTo(() => Project)
    policy!: Project;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    assignedAt!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    expiresAt?: Date;
}