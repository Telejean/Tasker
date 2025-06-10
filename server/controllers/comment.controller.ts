import type { Request, Response } from 'express';
import { Comment } from '../models/Comment.model';
import { CommentLike } from '../models/CommentLike.model';
import { User } from '../models/User.model';
import { Task } from '../models/Task.model';
import { Op } from 'sequelize';

export const commentController = {
    async getCommentsByTask(req: Request, res: Response) {
        try {
            const taskId = parseInt(req.params.taskId);

            if (!taskId) {
                return res.status(400).json({ error: 'Task ID is required' });
            }

            const task = await Task.findByPk(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            const comments = await Comment.findAll({
                where: { taskId },
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'surname', 'email']
                    },
                    {
                        model: Comment,
                        as: 'replies',
                        include: [
                            {
                                model: User,
                                as: 'author',
                                attributes: ['id', 'name', 'surname', 'email']
                            }
                        ]
                    },
                    {
                        model: CommentLike,
                        as: 'likes',
                        include: [
                            {
                                model: User,
                                attributes: ['id', 'name', 'surname']
                            }
                        ]
                    }
                ],
                order: [
                    ['createdAt', 'DESC'],
                    [{ model: Comment, as: 'replies' }, 'createdAt', 'ASC']
                ]
            });

            const topLevelComments = comments.filter(comment => !comment.parentCommentId);

            return res.status(200).json(topLevelComments);
        } catch (error) {
            console.error('Error getting comments:', error);
            return res.status(500).json({ error: 'Failed to retrieve comments' });
        }
    },

    async createComment(req: Request, res: Response) {
        try {
            const { content, taskId, parentCommentId } = req.body;
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!content || !taskId) {
                return res.status(400).json({ error: 'Content and task ID are required' });
            }

            const task = await Task.findByPk(taskId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            if (parentCommentId) {
                const parentComment = await Comment.findByPk(parentCommentId);
                if (!parentComment) {
                    return res.status(404).json({ error: 'Parent comment not found' });
                }
                if (parentComment.dataValues.taskId !== taskId) {
                    return res.status(400).json({ error: 'Parent comment must belong to the same task' });
                }
            }

            const comment = await Comment.create({
                content,
                authorId: userId,
                taskId,
                parentCommentId: parentCommentId || null
            });

            const createdComment = await Comment.findByPk(comment.id, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'surname', 'email']
                    }
                ]
            });

            return res.status(201).json(createdComment);
        } catch (error) {
            console.error('Error creating comment:', error);
            return res.status(500).json({ error: 'Failed to create comment' });
        }
    },

    async updateComment(req: Request, res: Response) {
        try {
            const commentId = parseInt(req.params.id);
            const { content } = req.body;
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            if (comment.dataValues.authorId !== userId) {
                return res.status(403).json({ error: 'You can only edit your own comments' });
            }

            await comment.update({
                content,
                isEdited: true,
                editedAt: new Date()
            });

            const updatedComment = await Comment.findByPk(commentId, {
                include: [
                    {
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'surname', 'email']
                    }
                ]
            });

            return res.status(200).json(updatedComment);
        } catch (error) {
            console.error('Error updating comment:', error);
            return res.status(500).json({ error: 'Failed to update comment' });
        }
    },

    async deleteComment(req: Request, res: Response) {
        try {
            const commentId = parseInt(req.params.id);
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            if (comment.dataValues.authorId !== userId) {
                return res.status(403).json({ error: 'You can only delete your own comments' });
            }

            const repliesCount = await Comment.count({
                where: { parentCommentId: commentId }
            });

            if (repliesCount > 0) {
                await comment.update({
                    content: '[Comment deleted]',
                    isEdited: true,
                    editedAt: new Date()
                });
                return res.status(200).json({ message: 'Comment content removed due to existing replies' });
            } else {
                await comment.destroy();
                return res.status(204).send();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            return res.status(500).json({ error: 'Failed to delete comment' });
        }
    },

    async toggleCommentLike(req: Request, res: Response) {
        try {
            const commentId = parseInt(req.params.id);
            const { type } = req.body; 
            const userId = (req.user as any)?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!type || !['like', 'dislike'].includes(type)) {
                return res.status(400).json({ error: 'Type must be either "like" or "dislike"' });
            }

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }
            console.log()
            console.log()
            console.log()
            console.log(comment);
            console.log(comment.dataValues.likesCount);
            console.log()
            console.log()
            console.log()

            const existingLike = await CommentLike.findOne({
                where: {
                    userId,
                    commentId
                }
            });

            if (existingLike) {
                if (existingLike.type === type) {
                    await existingLike.destroy();

                    if (type === 'like') {
                        await comment.update({ likesCount: comment.dataValues.likesCount - 1 });
                    } else {
                        await comment.update({ dislikesCount: comment.dataValues.dislikesCount - 1 });
                    }

                    return res.status(200).json({ message: `${type} removed` });
                } else {
                    await existingLike.update({ type });

                    if (type === 'like') {
                        await comment.update({
                            likesCount: comment.dataValues.likesCount + 1,
                            dislikesCount: comment.dataValues.dislikesCount - 1
                        });
                    } else {
                        await comment.update({
                            likesCount: comment.dataValues.likesCount - 1,
                            dislikesCount: comment.dataValues.dislikesCount + 1
                        });
                    }

                    return res.status(200).json({ message: `Reaction changed to ${type}` });
                }
            } else {
                await CommentLike.create({
                    userId,
                    commentId,
                    type
                });

                if (type === 'like') {
                    await comment.update({ likesCount: comment.likesCount + 1 });
                } else {
                    await comment.update({ dislikesCount: comment.dislikesCount + 1 });
                }

                return res.status(201).json({ message: `Comment ${type}d` });
            }
        } catch (error) {
            console.error('Error toggling comment like:', error);
            return res.status(500).json({ error: 'Failed to toggle comment like' });
        }
    },

    async getCommentLikes(req: Request, res: Response) {
        try {
            const commentId = parseInt(req.params.id);

            const comment = await Comment.findByPk(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const likes = await CommentLike.findAll({
                where: { commentId },
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'surname', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const groupedLikes = {
                likes: likes.filter(like => like.type === 'like'),
                dislikes: likes.filter(like => like.type === 'dislike')
            };

            return res.status(200).json(groupedLikes);
        } catch (error) {
            console.error('Error getting comment likes:', error);
            return res.status(500).json({ error: 'Failed to retrieve comment likes' });
        }
    }
};
