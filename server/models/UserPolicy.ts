import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';
import { Policy } from './Policy';

@Table
export class UserPolicy extends Model {
    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

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

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    expiresAt?: Date;
}