import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
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
    allowNull: false,
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

  //AI

  @Column({
    type:DataType.JSON,
    allowNull:true
  })
  tags?: JSON

   @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt?: Date;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  estimatedDuration?: number;


  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  actualDuration?: number;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  completionConfidence?: number;

    @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  difficulty?: number;

}
