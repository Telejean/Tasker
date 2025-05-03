import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { AssignedPerson } from './AssignedPerson';

@Table
export class User extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email!: string;

    @HasMany(() => AssignedPerson)
    assignedTasks!: AssignedPerson[];
}