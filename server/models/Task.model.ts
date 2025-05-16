import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { Project } from "./Project.model";
import { AssignedPerson } from "./AssignedPerson.model";
import { User } from "./User.model";

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
    type: DataType.TEXT,
    allowNull: false,
  })
  priority?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deadline?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "NOT_STARTED",
  })
  status!: string;

  @ForeignKey(() => User)
  @Column
  creatorId!: number;

  @BelongsTo(() => User)
  creator!: User;

  @ForeignKey(() => Project)
  @Column
  projectId!: number;

  @BelongsTo(() => Project)
  project!: Project;

  @HasMany(() => AssignedPerson)
  assignedUsers!: User[];
}
