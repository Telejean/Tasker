import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Policy } from './Policy';

@Table
export class Rule extends Model {
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
        type: DataType.ENUM('ALLOW', 'DENY'),
        allowNull: false,
        defaultValue: 'ALLOW',
    })
    effect!: string;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    subjectAttributes?: object;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    resourceAttributes?: object;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    actionAttributes?: object;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    environmentAttributes?: object;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    condition?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    priority!: number;

    @ForeignKey(() => Policy)
    @Column
    policyId!: number;

    @BelongsTo(() => Policy)
    policy!: Policy;
}