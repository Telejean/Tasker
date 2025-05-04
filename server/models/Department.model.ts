import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './User.model';

@Table
export class Department extends Model {
    @Column
    departmentName!: string

    @HasMany(() => User)
    users!: User[]
}