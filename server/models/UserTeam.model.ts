import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User.model';
import { Team } from './Team.model';

@Table
export class UserTeam extends Model {
    @ForeignKey(() => User)
    @Column
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Team)
    @Column
    teamId!: number;

    @BelongsTo(() => Team)
    team!: Team;


    @Column({
        type:DataType.STRING,
        allowNull:false,
        defaultValue: "MEMBER"
    })
    userRole!: string;

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