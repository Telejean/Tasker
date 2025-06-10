import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Index,
} from "sequelize-typescript";
import { User } from "./User.model";
import { Comment } from "./Comment.model";

@Table({
    indexes: [
        {
            unique: true,
            fields: ['userId', 'commentId']
        }
    ]
})
export class CommentLike extends Model {
    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @ForeignKey(() => Comment)
    @Column({
        allowNull: false,
    })
    commentId!: number;

    @BelongsTo(() => Comment)
    comment!: Comment;

    @Column({
        type: DataType.ENUM('like', 'dislike'),
        allowNull: false,
    })
    type!: 'like' | 'dislike';
}
