import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

@Table
export class PermissionLog extends Model {
    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    action!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    resource!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    allowed!: boolean;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    reason?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    timestamp!: Date;
}