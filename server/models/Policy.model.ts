import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Rule } from './Rule.model';
import { UserPolicy } from './UserPolicy.model';
import { ProjectPolicy } from './ProjectPolicy.model';
import { TaskPolicy } from './TaskPolicy.model';

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
        type: DataType.INTEGER,
        allowNull: true,
    })
    createdBy?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    updatedBy?: number;

    @HasMany(() => Rule)
    rules!: Rule[];

    @HasMany(() => UserPolicy)
    userAssignments!: UserPolicy[];

    @HasMany(() => ProjectPolicy)
    projectAssignments!: ProjectPolicy[];

    @HasMany(() => TaskPolicy)
    taskAssignments!: TaskPolicy[];
}