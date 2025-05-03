import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Rule } from './Rule';
import { UserPolicy } from './UserPolicy';
import { ProjectPolicy } from './ProjectPolicy';
import { TaskPolicy } from './TaskPolicy';

@Table
export class Policy extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    isActive!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })

    @HasMany(() => Rule, { as: 'policyRules2' })
    policyRules!: Rule[];

    @HasMany(() => UserPolicy)
    userAssignments!: UserPolicy[];

    @HasMany(() => ProjectPolicy)
    projectAssignments!: ProjectPolicy[];

    @HasMany(() => TaskPolicy)
    taskAssignments!: TaskPolicy[];
}