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
import { User } from "./User.model";
import { Task } from "./Task.model";
import { CommentLike } from "./CommentLike.model";

@Table
export class Comment extends Model {
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    authorId!: number;

    @BelongsTo(() => User)
    author!: User;

    @ForeignKey(() => Task)
    @Column({
        allowNull: false,
    })
    taskId!: number;

    @BelongsTo(() => Task)
    task!: Task;

    @ForeignKey(() => Comment)
    @Column({
        allowNull: true,
    })
    parentCommentId?: number;

    @BelongsTo(() => Comment, 'parentCommentId')
    parentComment?: Comment;
    @HasMany(() => Comment, 'parentCommentId')
    replies!: Comment[];

    @HasMany(() => CommentLike)
    likes!: CommentLike[];

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    likesCount!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    dislikesCount!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    isEdited!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    editedAt?: Date;
}
